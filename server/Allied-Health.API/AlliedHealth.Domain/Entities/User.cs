namespace AlliedHealth.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public bool Hidden { get; set; } = false;

        public int Role { get; set; }
        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

    }
}
