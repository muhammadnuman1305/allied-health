using AlliedHealth.Domain;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation
{
    public class TaskService : ITaskService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public TaskService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetTaskDTO> GetAll()
        {
            //var users = _dbContext.Users
            //                //.Where(t => t.Id != _userContext.UserId)
            //                .Select(t => new GetUserDTO
            //                {
            //                    Id = t.Id,
            //                    FirstName = t.FirstName,
            //                    LastName = t.LastName,
            //                    Username = t.Username,
            //                    Email = t.Email,
            //                    Role = t.Role,
            //                    Hidden = t.Hidden,
            //                }).AsQueryable();

            //return users;

            return null;
        }

        public async Task<GetTaskSummaryDTO> GetSummary()
        {
            //var summary = await _dbContext.Users
            //                 .Where(u => u.Hidden != true)
            //                 .GroupBy(u => 1)
            //                 .Select(g => new GetUserSummaryDTO
            //                 {
            //                     TotalUsers = g.Count(),
            //                     TotalProfessionals = g.Count(u => u.Role == (int)UserRoles.Professional),
            //                     TotalAssistants = g.Count(u => u.Role == (int)UserRoles.Assistant),
            //                     TotalAdmins = g.Count(u => u.Role == (int)UserRoles.SuperAdmin)
            //                 }).FirstOrDefaultAsync();

            //return summary ?? new GetUserSummaryDTO();

            return null;
        }

        public async Task<GetTaskDetailsDTO> GetTask(Guid id)
        {
            //var user = await _dbContext.Users
            //              .Where(t => t.Id == id)
            //              .Select(t => new GetUserDTO
            //              {
            //                  Id = t.Id,
            //                  FirstName = t.FirstName,
            //                  LastName = t.LastName,
            //                  Username = t.Username,
            //                  Email = t.Email,
            //                  Role = t.Role,
            //                  Hidden = t.Hidden,
            //              }).FirstOrDefaultAsync();

            //return user;

            return null;
        }

        public async Task<string?> CreateTask(AddUpdateTaskDTO request)
        {
            //var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Username == request.Username);

            //if (user != null)
            //    return EMessages.UserExistAlready;

            //var newUser = new User
            //{
            //    Id = Guid.NewGuid(),
            //    FirstName = request.FirstName,
            //    LastName = request.LastName,
            //    Username= request.Username,
            //    Email = request.Email,
            //    Password = PasswordHelper.HashPassword(request.Password),
            //    Role = request.Role,
            //    Hidden = false
            //};

            //await _dbContext.Users.AddAsync(newUser);
            //await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdateTask(AddUpdateTaskDTO request)
        {
            //var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Id == request.Id);

            //if (user == null)
            //    return EMessages.UserNotExists;

            //user.FirstName = request.FirstName;
            //user.LastName = request.LastName;
            //user.Email = request.Email;
            //user.Password = request.Password == null ? user.Password : PasswordHelper.HashPassword(request.Password);
            //user.Role = request.Role;

            //await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            //var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Id == id);

            //if (user == null)
            //    return EMessages.UserNotExists;

            //user.Hidden = !user.Hidden;
            //await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
