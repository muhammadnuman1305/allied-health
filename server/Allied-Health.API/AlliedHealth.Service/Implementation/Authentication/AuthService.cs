using AlliedHealth.Common.Enums;
using AlliedHealth.Common.Helpers;
using AlliedHealth.Domain;
using AlliedHealth.Domain.DTOs;
using AlliedHealth.Model.Entities;
using AlliedHealth.Service.Contract.Authentication;
using AlliedHealth.Service.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AlliedHealth.Service.Implementation.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly AlliedHealthDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthService(AlliedHealthDbContext dbContext, IConfiguration configuration) 
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        public async Task<(GetAuthUserDTO?, string?)> Authenticate(PostAuthUserDTO request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(t => t.Username == request.Username);

            if (user == null || user.Password == null || user.Hidden || request.IsAdmin != user.IsAdmin)
                return (null, EMessages.UserNotExists);

            var isValidPassword = PasswordHelper.VerifyPassword(request.Password, user.Password);

            if (!isValidPassword)
                return (null, EMessages.IncorrectUserPassword);

            var payload = new GetAuthUserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                AccessToken = await TokenHelper.GenerateAccessToken(user, _configuration),
                IsAdmin = user.IsAdmin,
                Role = user.Role
            };

            return (payload, null);
        }      
        
        public async Task<string?> Register(RegisterUserDTO request)
        {
            var existingUser = await _dbContext.Users
                        .Where(t => t.Username == request.Username || t.Email == request.Email)
                        .FirstOrDefaultAsync();

            if (existingUser != null)
                return EMessages.UserExistAlready;

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Username = request.Username,
                Email = request.Email,
                Password = PasswordHelper.HashPassword(request.Password),
                Role = request.Role
            };

            await _dbContext.Users.AddAsync(newUser);
            await _dbContext.SaveChangesAsync();

            return null;
        }
    }
}
