namespace AlliedHealth.Domain.DTOs
{
    public class GetUserDTO
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public int Role { get; set; }
        public bool IsAdmin { get; set; } = false;
        public bool Hidden { get; set; }
    }

    public class GetUserSummaryDTO 
    { 
        public int TotalUsers { get; set; }
        public int TotalProfessionals { get; set; }
        public int TotalAssistants { get; set; }
        public int TotalAdmins { get; set; }
    }

    public class AddUpdateUserDTO
    {
        public Guid? Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public required string Email { get; set; }
        public int Role { get; set; }
        public bool IsAdmin { get; set; } = false;
    }
}
