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


        // Department (optional for now)
        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        // Many-to-many with Specialty
        public ICollection<UserSpecialty> UserSpecialties { get; set; } = new List<UserSpecialty>();
    }
}
