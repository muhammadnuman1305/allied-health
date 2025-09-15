﻿using AlliedHealth.Service.Contract.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace AlliedHealth.Service.Implementation.Authentication
{
    public class UserContext : IUserContext
    {
        public UserContext(IPrincipal principal)
        {
            if (principal?.Identity == null) return;

            if (principal.Identity is ClaimsIdentity claims)
            {
                Claims = claims;
                UserName = principal.Identity.Name;

                // Parse the user's unique ID from claims
                var userIdValue = claims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdValue, out Guid parsedUserId))
                {
                    UserId = parsedUserId;
                }

                // Check if the user has the "Admin" role
                IsAdmin = principal.IsInRole("Admin");

                // Parse IsAHP from your custom claim
                var role = claims.FindFirst("Role")?.Value;
                if (int.TryParse(role, out int parsedRole))
                {
                    Role = parsedRole;
                }
            }
        }

        public Guid? UserId { get; }
        public string? UserName { get; }
        public bool IsAdmin { get; } = false;
        public int Role { get; }
        public ClaimsIdentity? Claims { get; set; }

        public List<Claim> GetClaims(string claimId)
        {
            if (Claims == null) return new List<Claim>();
            var hasClaim = Claims.HasClaim(t => t.Type == claimId);
            return hasClaim ? Claims.Claims.Where(t => t.Type == claimId).ToList() : new List<Claim>();
        }
    }
}
