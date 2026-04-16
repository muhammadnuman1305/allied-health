using AlliedHealth.Domain;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Common.Enums;
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

            // Pre-load all AHAs with their specialties via join
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

            // Count existing task slots per AHA on the start date
            var ahaSlotCounts = await _dbContext.TaskInterventions
                .Where(ti =>
                    ti.StartDate <= request.StartDate &&
                    ti.EndDate >= request.StartDate)
                .GroupBy(ti => ti.AhaUserId)
                .Select(g => new { AhaId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.AhaId, x => x.Count);

            foreach (var interventionId in request.InterventionIds)
            {
                var intervention = await _dbContext.Interventions
                    .Where(i => i.Id == interventionId)
                    .Select(i => new { i.Id, i.Name, i.SpecialtyId })
                    .FirstOrDefaultAsync();

                if (intervention == null)
                    continue;

                // Filter AHAs with matching specialty and available slots
                var eligible = ahas
                    .Where(a => a.SpecialtyIds.Contains(intervention.SpecialtyId))
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        Slots = ahaSlotCounts.TryGetValue(a.Id, out var count) ? count : 0
                    })
                    .Where(a => a.Slots < MaxDailySlotsPerAha)
                    .OrderBy(a => a.Slots) // least busy first
                    .FirstOrDefault();

                results.Add(new AutoAssignResultDTO
                {
                    InterventionId = intervention.Id,
                    InterventionName = intervention.Name,
                    SuggestedAhaId = eligible?.Id,
                    SuggestedAhaName = eligible?.Name,
                    CurrentDaySlots = eligible?.Slots ?? 0,
                    CanAssign = eligible != null
                });
            }

            return results;
        }
    }
}
