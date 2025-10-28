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
    public class DepartmentService : IDepartmentService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public DepartmentService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetDepartmentDTO> GetAll()
        {
            var deptList = _dbContext.Departments
                            .Select(t => new GetDepartmentDTO
                            {
                                Id = t.Id,
                                Name = t.Name,
                                Code = t.Code,
                                DeptHeadName = t.DeptHeadUser.FirstName + " " + t.DeptHeadUser.LastName,
                                //ActiveAssistants = _dbContext.Users.Count(u => u. == t.Id && u.Hidden != true),
                                //OpenTasks = _dbContext.Tasks.Count(tsk => tsk.DepartmentId == t.Id && tsk.Status == (int)ETaskStatus.Active),
                                //OverdueTasks = _dbContext.Tasks.Count(tsk => tsk.DepartmentId == t.Id && tsk.Status == (int)ETaskStatus.Overdue),
                                LastUpdated = t.ModifiedDate,
                                Hidden = t.Hidden
                            }).AsQueryable();

            return deptList;
        }

        public async Task<GetDepartmentSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Departments
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetDepartmentSummaryDTO
                             {
                                 TotalDepartments = g.Count(),
                                 ActiveDepartments = g.Count(u => u.CreatedDate >= DateTime.UtcNow.AddDays(-7)),
                                 //OpenTasks = g.Sum(u => u..Count(t => t.Status == (int)ETaskStatus.Active)),
                                 //OverdueTasks = g.Sum(u => u.Tasks.Count(t => t.Status == (int)ETaskStatus.Completed))
                             }).FirstOrDefaultAsync();

            return summary ?? new GetDepartmentSummaryDTO();
        }

        public async Task<GetDepartmentDetailsDTO> GetDepartment(Guid id)
        {
            var dept = await _dbContext.Departments
                          .Where(t => t.Id == id)
                          .Select(t => new GetDepartmentDetailsDTO
                          {
                              Id = t.Id,
                              Name = t.Name,
                              Code = t.Code,
                              Purpose = t.Purpose,
                              ContactNumber = t.ContactNumber,
                              Email = t.EmailAddress,
                              Description = t.Description,
                              DeptHeadId = t.DeptHeadId,
                              DefaultTaskPriority = t.DefaultTaskPriority,
                              OperatingFrom = t.OperatingFrom,
                              OperatingTo = t.OperatingTo,
                              //Hidden = t.Hidden
                          }).FirstOrDefaultAsync();

            return dept;
        }

        public async Task<string?> CreateDepartment(AddUpdateDepartmentDTO request)
        {
            var dept = await _dbContext.Departments.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (dept != null)
                return EMessages.DeptExistAlready;

            var newDept = new Department
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Code = request.Code,
                Purpose = request.Purpose,
                ContactNumber = request.ContactNumber,
                EmailAddress = request.Email,
                Description = request.Description,
                DeptHeadId = request.DeptHeadId,
                DefaultTaskPriority = request.DefaultTaskPriority,
                OperatingFrom = request.OperatingFrom,
                OperatingTo = request.OperatingTo,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = _userContext.UserId,
                Hidden = false
            };

            await _dbContext.Departments.AddAsync(newDept);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdateDepartment(AddUpdateDepartmentDTO request)
        {
            var dept = await _dbContext.Departments.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (dept == null)
                return EMessages.DeptNotExists;

            dept.Name = request.Name;
            dept.Purpose = request.Purpose;
            dept.Code = request.Code;
            dept.ContactNumber = request.ContactNumber;
            dept.EmailAddress = request.Email;
            dept.Description = request.Description;
            dept.DeptHeadId = request.DeptHeadId;
            dept.DefaultTaskPriority = request.DefaultTaskPriority;
            dept.OperatingFrom = request.OperatingFrom;
            dept.OperatingTo = request.OperatingTo;
            dept.ModifiedDate = DateTime.UtcNow;
            dept.ModifiedBy = _userContext.UserId;

            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var dept = await _dbContext.Departments.FirstOrDefaultAsync(t => t.Id == id);

            if (dept == null)
                return EMessages.DeptNotExists;

            dept.Hidden = !dept.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<List<GetDeptHeadOptions>> GetDeptHeads()
        {
            var deptHeads = await _dbContext.Users
                                .Where(x => x.Role == (int)UserRoles.Professional)
                                .Select(x => new GetDeptHeadOptions
                                {
                                    Id = x.Id,
                                    Name = x.FirstName + " " + x.LastName
                                })
                                .ToListAsync();

            return deptHeads;
        }
    }
}
