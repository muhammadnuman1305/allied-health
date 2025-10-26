using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Model.Entities;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation
{
    public class PatientService : IPatientService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public PatientService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _userContext = userContext;
        }

        public IQueryable<GetUserDTO> GetAll()
        {
            var users = _dbContext.Users
                            //.Where(t => t.Id != _userContext.UserId)
                            .Select(t => new GetUserDTO
                            {
                                Id = t.Id,
                                FirstName = t.FirstName,
                                LastName = t.LastName,
                                Username = t.Username,
                                Email = t.Email,
                                Role = t.IsAdmin ? 3 : t.Role,
                                IsAdmin = t.IsAdmin,
                                Hidden = t.Hidden,
                            }).AsQueryable();

            return users;
        }

        public async Task<GetUserSummaryDTO> GetSummary()
        {
            var summary = await _dbContext.Users
                             .Where(u => u.Hidden != true)
                             .GroupBy(u => 1)
                             .Select(g => new GetUserSummaryDTO
                             {
                                 TotalUsers = g.Count(),
                                 TotalProfessionals = g.Count(u => u.Role == (int)UserRoles.Professional),
                                 TotalAssistants = g.Count(u => u.Role == (int)UserRoles.Assistant),
                                 TotalAdmins = g.Count(u => u.IsAdmin)
                             }).FirstOrDefaultAsync();

            return summary ?? new GetUserSummaryDTO();
        }

        public async Task<GetUserDTO> GetUser(Guid id)
        {
            var user = await _dbContext.Users
                          .Where(t => t.Id == id)
                          .Select(t => new GetUserDTO
                          {
                              Id = t.Id,
                              FirstName = t.FirstName,
                              LastName = t.LastName,
                              Username = t.Username,
                              Email = t.Email,
                              Role = t.Role,
                              IsAdmin = t.IsAdmin,
                              Hidden = t.Hidden,
                          }).FirstOrDefaultAsync();

            return user;
        }

        public async Task<string?> CreateUser(AddUpdateUserDTO request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Username == request.Username);

            if (user != null)
                return EMessages.UserExistAlready;

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Username= request.Username,
                Email = request.Email,
                Password = PasswordHelper.HashPassword(request.Password),
                Role = request.Role,
                IsAdmin = request.IsAdmin,
                Hidden = false
            };

            await _dbContext.Users.AddAsync(newUser);
            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> UpdateUser(AddUpdateUserDTO request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Id == request.Id);

            if (user == null)
                return EMessages.UserNotExists;

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.Password = request.Password == null ? user.Password : PasswordHelper.HashPassword(request.Password);
            user.Role = request.Role;

            await _dbContext.SaveChangesAsync();

            return null;
        }

        public async Task<string?> ToggleHide(Guid id)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Id == id);

            if (user == null)
                return EMessages.UserNotExists;

            user.Hidden = !user.Hidden;
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
