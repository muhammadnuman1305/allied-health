using System.Security.Claims;

namespace AlliedHealth.Service.Contract.Authentication
{
    public interface IUserContext
    {
        Guid? UserId { get; }
        string? UserName { get; }
        bool IsAdmin { get; }
        int Role { get; } // 1 for AHP, 2 for others based on your existing logic
        ClaimsIdentity? Claims { get; }
        List<Claim> GetClaims(string claimId);
    }
}
