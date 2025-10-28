namespace AlliedHealth.Domain.Entities
{
    public class Department
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Purpose { get; set; }
        public string Code { get; set; }
        //public int SpecialtyId { get; set; }
        public string Description { get; set; }
        public string ContactNumber { get; set; }
        public string EmailAddress { get; set; }

        // Staff & Settings
        public Guid DeptHeadId { get; set; } // User - AHP
        public int DefaultTaskPriority { get; set; }
        public TimeSpan OperatingFrom { get; set; }
        public TimeSpan OperatingTo { get; set; }


        // Auditing
        public DateTime CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; } = false;

        // Navigation
        //public Specialty Specialty { get; set; } = default!;
        public User DeptHeadUser { get; set; } = default!;
        public ICollection<User> AlliedAssistants { get; set; } = new List<User>();

    }
}
