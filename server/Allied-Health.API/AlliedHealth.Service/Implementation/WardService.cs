using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Domain.Entities;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation
{
    public class WardService : IWardService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public WardService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetWardDTO> GetAll()
        {
            var wardList = _dbContext.Wards
                            .Select(t => new GetWardDTO
                            {
                                Id = t.Id,
                                Name = t.Name,
                                Code = t.Code,
                                Location = t.Location,
                                BedCount = t.BedCount,
                                DefaultDepartmentName = t.DefaultDepartment.Name,
                                CurrentPatients = 0,
                                OpenTasks = 0,
                                OverdueTasks = 0,
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden
                            }).AsQueryable();

            return wardList;
        }

        public async Task<GetWardSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Wards
                             .GroupBy(u => 1)
                             .Select(g => new GetWardSummaryDTO
                             {
                                 TotalWards = g.Count(),
                                 ActiveWards = g.Count(u => u.Hidden != true),
                                 TotalBeds = g.Where(x => x.Hidden != true).Sum(u => u.BedCount),
                                 //OccupiedBeds = _dbContext.Patients.Count(p => p.WardId != null && g.Select(w => w.Id).Contains(p.WardId.Value) && p.DischargeDate == null)
                                 OccupiedBeds = 0
                             }).FirstOrDefaultAsync();

            return summary ?? new GetWardSummaryDTO();
        }

        public async Task<GetWardDetailsDTO> GetWard(Guid id)
        {
            var ward = await _dbContext.Wards
                          .Where(t => t.Id == id)
                          .Select(t => new GetWardDetailsDTO
                          {
                              Id = t.Id,
                              Name = t.Name,
                              Code = t.Code,
                              Location = t.Location,
                              BedCount = t.BedCount,
                              Description = t.Description,
                              DefaultDepartmentId = t.DefaultDepartmentId,
                              DepartmentCoverages = t.DepartmentCoverages.Select(dc => dc.DepartmentId).ToList(),
                              CurrentPatients = 0,
                              OpenTasks = 0,
                              OverdueTasks = 0,
                              DeptCoverages = 0
                          }).FirstOrDefaultAsync();

            return ward;
        }

        public async Task<string?> CreateWard(AddUpdateWardDTO request)
        {
            var ward = await _dbContext.Wards.FirstOrDefaultAsync(t => t.Id == request.Id || t.Name == request.Name || t.Code == request.Code);

            if (ward != null)
                return EMessages.WardExistAlready;

            var wardId = Guid.NewGuid();
            var newWard = new Ward
            {
                Id = wardId,
                Name = request.Name,
                Code = request.Code,
                Location = request.Location,
                BedCount = request.BedCount,
                Description = request.Description,
                DefaultDepartmentId = request.DefaultDepartment,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Wards.AddAsync(newWard);
            await _dbContext.SaveChangesAsync();

            foreach (var cov in request.CoverageDepartments ?? [])
            {
                var wardDeptCoverage = new WardDeptCoverage
                {
                    WardId = wardId,
                    DepartmentId = cov,
                    CreatedDate = DateTime.UtcNow
                };
                await _dbContext.WardDeptCoverages.AddAsync(wardDeptCoverage);
                await _dbContext.SaveChangesAsync();
            }

            return null;
        }

        public async Task<string?> UpdateWard(AddUpdateWardDTO request)
        {
            var ward = await _dbContext.Wards.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (ward == null)
                return EMessages.WardNotExists;
            
            var wards = await _dbContext.Wards
                            .Where(t => t.Id != request.Id && (t.Name == request.Name || t.Code == request.Code))
                            .ToListAsync();
            if(wards.Any())
                return EMessages.WardNotExists;

            ward.Name = request.Name;
            ward.Code = request.Code;
            ward.Location = request.Location;
            ward.BedCount = request.BedCount;
            ward.Description = request.Description;
            ward.DefaultDepartmentId = request.DefaultDepartment;

            var wardDeptCoverages = await _dbContext.WardDeptCoverages.Where(wdc => wdc.WardId == ward.Id).ToListAsync();

            if(wardDeptCoverages.Any())
            {
                _dbContext.WardDeptCoverages.RemoveRange(wardDeptCoverages);
                await _dbContext.SaveChangesAsync();
            }

            foreach (var cov in request.CoverageDepartments ?? [])
            {
                var wardDeptCoverage = new WardDeptCoverage
                {
                    WardId = ward.Id,
                    DepartmentId = cov,
                    CreatedDate = DateTime.UtcNow,
                };
                await _dbContext.WardDeptCoverages.AddAsync(wardDeptCoverage);
            }

            ward.ModifiedDate = DateTime.UtcNow;
            ward.ModifiedBy = _userContext.UserId;

            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var ward = await _dbContext.Wards.FirstOrDefaultAsync(t => t.Id == id);

            if (ward == null)
                return EMessages.DeptNotExists;

            ward.Hidden = !ward.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<List<GetDefaultDepartmentDTO>> GetDefaultDepartments()
        {
            var deptList = await _dbContext.Departments
                                .Select(x => new GetDefaultDepartmentDTO
                                {
                                    Id = x.Id,
                                    Name = x.Name,
                                    Code = x.Code,
                                    Purpose = x.Purpose
                                }).ToListAsync();

            return deptList;
        }

    }
}
