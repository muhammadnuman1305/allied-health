namespace AlliedHealth.Domain.DTOs
{
    public class RegisterUserDTO
    {
        public Guid? Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Username { get; set;} = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int Role { get; set; }
    }

    public class PostAuthUserDTO
    {
        public required string Username { get; set; }
        public string? Email { get; set; }
        //public string Phone { get; set; }
        public required string Password { get; set; }
        public bool IsAdmin { get; set; } = false;
    }

    public class GetAuthUserDTO
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string AccessToken { get; set; }
        public int Role { get; set; }
        public bool IsAdmin { get; set; }
    }
}
