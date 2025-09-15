using AlliedHealth.Domain.DTOs;

namespace AlliedHealth.Service.Contract.Authentication
{
    public interface IAuthService
    {
        Task<(GetAuthUserDTO?, string?)> Authenticate(PostAuthUserDTO request);
        Task<string?> Register(RegisterUserDTO request);
    }
}
