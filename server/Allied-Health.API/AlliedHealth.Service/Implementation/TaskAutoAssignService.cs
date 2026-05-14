using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AlliedHealth.Service.Implementation
{
    public class TaskAutoAssignService : ITaskAutoAssignService
    {
        private const int MaxDailySlotsPerAha = 12;
        private readonly AlliedHealthDbContext _dbContext;

        public TaskAutoAssignService(AlliedHealthDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// For each intervention, find the best available AHA based on:
        ///   1. AHA has matching specialty (skill)
        ///   2. AHA has fewer than 12 task slots on the task start date
        ///   3. Prefer AHA with fewest existing slots (most available)
        /// </summary>
        public async Task<List<AutoAssignResultDTO>> GetAutoAssignSuggestions(AutoAssignRequestDTO request)
        {
            var results = new List<AutoAssignResultDTO>();

            // Pre-load all AHAs with their specialties
            var ahaRows = await (from u in _dbContext.Users
                                 where u.Role == (int)UserRoles.Assistant && !u.Hidden
                                 join us in _dbContext.UserSpecialties on u.Id equals us.UserId into usGroup
                                 from us in usGroup.DefaultIfEmpty()
                                 select new
                                 {
                                     u.Id,
                                     Name = u.FirstName + " " + u.LastName,
                                     SpecialtyId = (Guid?)us.SpecialtyId
                                 }).ToListAsync();

            var ahas = ahaRows
                .GroupBy(r => new { r.Id, r.Name })
                .Select(g => new
                {
                    g.Key.Id,
                    g.Key.Name,
                    SpecialtyIds = g.Where(r => r.SpecialtyId.HasValue)
                                    .Select(r => r.SpecialtyId!.Value)
                                    .ToList()
                }).ToList();

            // Pre-load all approved AHA vacations — checked per-intervention below
            var allVacations = await _dbContext.VacationRequests
                .Where(v => v.Status == (int)EVacationStatus.Approved)
                .Select(v => new { v.AhaUserId, v.StartDate, v.EndDate })
                .ToListAsync();

            var vacationsByAha = allVacations
                .GroupBy(v => v.AhaUserId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Pre-load all existing task-intervention date ranges for slot counting
            var allTaskInterventions = await _dbContext.TaskInterventions
                .Select(ti => new { ti.AhaUserId, ti.WardId, ti.StartDate, ti.EndDate })
                .ToListAsync();

            // Load wards covering the task's department, pick least-busy over the task range
            (Guid Id, string Name)? suggestedWard = null;
            if (request.DepartmentId.HasValue)
            {
                var wardRows = await _dbContext.Wards
                    .Where(w => !w.Hidden &&
                                w.DepartmentCoverages.Any(c => c.DepartmentId == request.DepartmentId.Value))
                    .Select(w => new { w.Id, w.Name })
                    .ToListAsync();

                if (wardRows.Count > 0)
                {
                    var wardIds = wardRows.Select(w => w.Id).ToHashSet();
                    var wardSlotCounts = allTaskInterventions
                        .Where(ti =>
                            wardIds.Contains(ti.WardId) &&
                            ti.StartDate <= request.TaskEndDate &&
                            ti.EndDate >= request.TaskStartDate)
                        .GroupBy(ti => ti.WardId)
                        .ToDictionary(g => g.Key, g => g.Count());

                    var best = wardRows
                        .Select(w => new { w.Id, w.Name, Slots = wardSlotCounts.TryGetValue(w.Id, out var s) ? s : 0 })
                        .OrderBy(w => w.Slots)
                        .First();

                    suggestedWard = (best.Id, best.Name);
                }
            }

            foreach (var item in request.Interventions)
            {
                // Use intervention-specific dates if provided; fall back to task dates for slot counts only
                var hasSpecificDates = item.StartDate.HasValue && item.EndDate.HasValue;
                var invStart = item.StartDate ?? request.TaskStartDate;
                var invEnd   = item.EndDate   ?? request.TaskEndDate;

                var intervention = await _dbContext.Interventions
                    .Where(i => i.Id == item.Id)
                    .Select(i => new { i.Id, i.Name, i.SpecialtyId })
                    .FirstOrDefaultAsync();

                if (intervention == null)
                    continue;

                // Slot counts always apply; vacation exclusion only applies when specific dates are known
                var ahaSlotCounts = allTaskInterventions
                    .Where(ti => ti.StartDate <= invEnd && ti.EndDate >= invStart)
                    .GroupBy(ti => ti.AhaUserId)
                    .ToDictionary(g => g.Key, g => g.Count());

                var eligible = ahas
                    .Where(a =>
                        a.SpecialtyIds.Contains(intervention.SpecialtyId) &&
                        (!hasSpecificDates ||
                         !vacationsByAha.TryGetValue(a.Id, out var vacs) ||
                         !vacs.Any(v => v.StartDate <= invEnd && v.EndDate >= invStart)))
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        Slots = ahaSlotCounts.TryGetValue(a.Id, out var count) ? count : 0
                    })
                    .Where(a => a.Slots < MaxDailySlotsPerAha)
                    .OrderBy(a => a.Slots)
                    .FirstOrDefault();

                results.Add(new AutoAssignResultDTO
                {
                    InterventionId = intervention.Id,
                    InterventionName = intervention.Name,
                    SuggestedAhaId = eligible?.Id,
                    SuggestedAhaName = eligible?.Name,
                    SuggestedWardId = suggestedWard?.Id,
                    SuggestedWardName = suggestedWard?.Name,
                    CurrentDaySlots = eligible?.Slots ?? 0,
                    CanAssign = eligible != null
                });
            }

            return results;
        }
    }
}
