using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using AlliedHealth.Common.Enums;
using AlliedHealth.Domain.Entities;
using Task = AlliedHealth.Domain.Entities.Task;

namespace AlliedHealth.Service.Implementation
{
    public class ReferralService : IReferralService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public ReferralService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetReferralDTO> GetAll()
        {
            var tasks = _dbContext.Referrals
                            .Select(t => new GetReferralDTO
                            {
                                Id = t.Id,
                                Type = (_userContext.DepartmentId != Guid.Empty
                                            ? (t.OriginDepartmentId == _userContext.DepartmentId
                                                ? "outgoing"
                                                : (t.DestinationDepartmentId == _userContext.DepartmentId ? "incoming" : null))
                                            : null) ?? string.Empty,
                                PatientId = t.PatientId,
                                PatientName = t.Patient.FullName,
                                OriginDeptId = t.OriginDepartmentId,
                                OriginDeptName = t.OriginDepartment.Name,
                                DestinationDeptId = t.DestinationDepartmentId,
                                DestinationDeptName= t.DestinationDepartment.Name,
                                TherapistId = t.ReferringTherapist,
                                TherapistName = _dbContext.Users
                                                .Where(u => u.Id == t.ReferringTherapist)
                                                .Select(u => string.Concat(u.FirstName, " ", u.LastName))
                                                .FirstOrDefault() ?? string.Empty,
                                Priority = t.Priority,
                                ReferralDate = DateOnly.FromDateTime(t.CreatedDate),
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden,
                            }).AsQueryable();

            return tasks;
        }

        public async Task<GetReferralSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Tasks
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetReferralSummaryDTO
                             {
                                 TotalTasks = g.Count(),
                                 OverdueTasks = g.Count(x => x.Status == (int)ETaskStatus.Overdue),
                                 ActiveTasks = g.Count(x => x.Status == (int)ETaskStatus.InProgress),
                                 CompletedTasks = g.Count(x => x.Status == (int)ETaskStatus.Completed),

                                 HighPriority = g.Count(x => x.Priority == (int)ETaskPriorities.High),
                                 MidPriority = g.Count(x => x.Priority == (int)ETaskPriorities.Medium),
                                 LowPriority = g.Count(x => x.Priority == (int)ETaskPriorities.Low),

                                 DeptWiseSummary = g.GroupBy(x => x.Department.Name)
                                                    .Select(d => new DeptTaskSummary
                                                    {
                                                        Name = d.Key,
                                                        Count = d.Count()
                                                    }).ToList()
                             }).FirstOrDefaultAsync();

            return summary ?? new GetReferralSummaryDTO();
        }

        public async Task<GetReferralDetailsDTO> GetReferral(Guid id)
        {
            var task = await _dbContext.Referrals
                        .Where(x => x.Id == id)
                        .Select(x => new GetReferralDetailsDTO
                        {
                            Id = x.Id,
                            PatientId = x.PatientId,
                            OriginDeptId = x.OriginDepartmentId,
                            DestinationDeptId = x.DestinationDepartmentId,
                            Priority = x.Priority,
                            Diagnosis = x.Diagnosis,
                            Goals = x.Goals,
                            //ReferralDate = x.CreatedDate,
                            Description = x.Description,
                            Interventions = x.ReferralInterventions.Select(ri => new ReferralInterventionItemDTO
                            {
                                Id = ri.InterventionId,
                                Components = ri.SelectedComponents.Select(c => new ReferralSelectedComponentDTO
                                {
                                    ComponentType = c.ComponentType.Name,
                                    Value = c.Value
                                }).ToList()
                            }).ToList()
                        }).FirstOrDefaultAsync();

            return task;
        }

        public async Task<string?> CreateReferral(AddUpdateReferralDTO request)
        {
            var patient = await _dbContext.Patients.FirstOrDefaultAsync(x => x.Id == request.PatientId);

            if (patient == null)
                return EMessages.PatientNotExists;

            var orgDept = await _dbContext.Departments.FirstOrDefaultAsync(x => x.Id == request.OriginDeptId);
            var destDept = await _dbContext.Departments.FirstOrDefaultAsync(x => x.Id == request.DestinationDeptId);

            if (orgDept == null)
                return "Origin " + EMessages.DeptNotExists;

            if (destDept == null)
                return "Destination " + EMessages.DeptNotExists;

            var referralId = Guid.NewGuid();

            var newReferral = new Referral
            {
                Id = referralId,
                PatientId = request.PatientId,
                OriginDepartmentId = request.OriginDeptId,
                DestinationDepartmentId = request.DestinationDeptId,
                ReferringTherapist = request.TherapistId,
                Priority = request.Priority,
                Diagnosis = request.Diagnosis,
                Goals = request.Goals,
                Description = request.Description,
                Status = (int)EReferralOutcomes.Pending,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Referrals.AddAsync(newReferral);
            await _dbContext.SaveChangesAsync();

            // Pre-fetch component type lookup to avoid per-row queries
            var compTypeMap = await _dbContext.ComponentTypes
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            foreach (var inv in request.Interventions)
            {
                var refInvId = Guid.NewGuid();
                var refInv = new ReferralIntervention
                {
                    Id = refInvId,
                    ReferralId = referralId,
                    InterventionId = inv.Id
                };

                await _dbContext.ReferralInterventions.AddAsync(refInv);

                if (inv.Components != null)
                {
                    foreach (var comp in inv.Components)
                    {
                        if (compTypeMap.TryGetValue(comp.ComponentType, out var typeId))
                        {
                            await _dbContext.ReferralInterventionComponents.AddAsync(new ReferralInterventionComponent
                            {
                                Id = Guid.NewGuid(),
                                ReferralInterventionId = refInvId,
                                ComponentTypeId = typeId,
                                Value = comp.Value.Trim()
                            });
                        }
                    }
                }
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> UpdateReferral(AddUpdateReferralDTO request)
        {
            var referral = await _dbContext.Referrals
                                 .Include(x => x.ReferralInterventions)
                                     .ThenInclude(ri => ri.SelectedComponents)
                                 .FirstOrDefaultAsync(x => x.Id == request.Id);

            if (referral == null)
                return EMessages.ReferralNotExists;

            var requestInterventionIds = request.Interventions.Select(i => i.Id).ToHashSet();

            // ── Step 1: Remove dropped interventions (CASCADE deletes their components)
            //           and flush existing SelectedComponents for kept interventions
            var toRemove = referral.ReferralInterventions
                .Where(ri => !requestInterventionIds.Contains(ri.InterventionId))
                .ToList();
            _dbContext.ReferralInterventions.RemoveRange(toRemove);

            var keptByInterventionId = referral.ReferralInterventions
                .Where(ri => requestInterventionIds.Contains(ri.InterventionId))
                .ToDictionary(ri => ri.InterventionId);

            foreach (var kept in keptByInterventionId.Values)
            {
                _dbContext.ReferralInterventionComponents.RemoveRange(kept.SelectedComponents);
                kept.SelectedComponents.Clear();
            }

            await _dbContext.SaveChangesAsync(); // flush all deletions first

            // ── Step 2: Update referral scalars
            referral.Priority = request.Priority;
            referral.Diagnosis = request.Diagnosis;
            referral.Goals = request.Goals;
            referral.Description = request.Description;
            referral.ModifiedDate = DateTime.UtcNow;
            referral.ModifiedBy = _userContext.UserId;

            // Pre-fetch component type lookup
            var compTypeMap = await _dbContext.ComponentTypes
                .ToDictionaryAsync(ct => ct.Name, ct => ct.Id);

            // ── Step 3: Upsert interventions and insert fresh SelectedComponents
            foreach (var inv in request.Interventions)
            {
                Guid refInvId;

                if (keptByInterventionId.TryGetValue(inv.Id, out var existing))
                {
                    refInvId = existing.Id;
                }
                else
                {
                    refInvId = Guid.NewGuid();
                    await _dbContext.ReferralInterventions.AddAsync(new ReferralIntervention
                    {
                        Id = refInvId,
                        ReferralId = referral.Id,
                        InterventionId = inv.Id
                    });
                }

                if (inv.Components != null)
                {
                    foreach (var comp in inv.Components)
                    {
                        if (compTypeMap.TryGetValue(comp.ComponentType, out var typeId))
                        {
                            await _dbContext.ReferralInterventionComponents.AddAsync(new ReferralInterventionComponent
                            {
                                Id = Guid.NewGuid(),
                                ReferralInterventionId = refInvId,
                                ComponentTypeId = typeId,
                                Value = comp.Value.Trim()
                            });
                        }
                    }
                }
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var referral = await _dbContext.Referrals.FirstOrDefaultAsync(t => t.Id == id);

            if (referral == null)
                return EMessages.ReferralNotExists;

            referral.Hidden = !referral.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
