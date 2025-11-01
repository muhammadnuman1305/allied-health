using AlliedHealth.Common.Enums;
using AlliedHealth.Domain;
using AlliedHealth.Service.DTOs;
using AlliedHealth.Domain.Entities;
using AlliedHealth.Service.Contract;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation
{
    public class UserService : IUserService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly IUserContext _userContext;

        public UserService(AlliedHealthDbContext dbContext, IConfiguration configuration, IUserContext userContext) 
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
                                Role = t.Role,
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
                                 TotalAdmins = g.Count(u => u.Role == (int)UserRoles.SuperAdmin)
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
                              SelectedSpecialties = t.UserSpecialties.Select(x => x.SpecialtyId).ToList(),
                              Hidden = t.Hidden,
                          }).FirstOrDefaultAsync();

            return user;
        }

        public async Task<string?> CreateUser(AddUpdateUserDTO request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Username == request.Username);

            if (user != null)
                return EMessages.UserExistAlready;

            var userId = Guid.NewGuid();
            var newUser = new User
            {
                Id = userId,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Username= request.Username,
                Email = request.Email,
                Password = PasswordHelper.HashPassword(request.Password),
                Role = request.Role,
                Hidden = false
            };

            await _dbContext.Users.AddAsync(newUser);
            await _dbContext.SaveChangesAsync();

            foreach(var spec in request.SelectedSpecialties)
            {
                var newUserSpec = new UserSpecialty
                {
                    UserId = userId,
                    SpecialtyId = spec,
                    CreatedDate = DateTime.UtcNow
                };

                await _dbContext.AddAsync(newUserSpec);
            }

            await _dbContext.SaveChangesAsync();
            return null;
        }

        public async Task<string?> UpdateUser(AddUpdateUserDTO request)
        {
            var user = await _dbContext.Users
                            .Include(x => x.UserSpecialties)
                            .FirstOrDefaultAsync(t => t.Id == request.Id);

            if (user == null)
                return EMessages.UserNotExists;

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.Password = request.Password == null ? user.Password : PasswordHelper.HashPassword(request.Password);
            user.Role = request.Role;

            if (user.UserSpecialties.Any())
            {
                _dbContext.UserSpecialties.RemoveRange(user.UserSpecialties);
                await _dbContext.SaveChangesAsync();
            }

            foreach (var spec in request.SelectedSpecialties)
            {
                var newUserSpec = new UserSpecialty
                {
                    UserId = user.Id,
                    SpecialtyId = spec,
                    CreatedDate = DateTime.UtcNow,
                };

                await _dbContext.AddAsync(newUserSpec);
            }

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
