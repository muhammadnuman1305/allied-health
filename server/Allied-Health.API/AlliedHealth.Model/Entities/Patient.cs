namespace AlliedHealth.Model.Entities
{
    public class Patient
    {
        public int Id { get; set; } // PK - MRN
        public string FullName { get; set; } = default!;
        public DateOnly? DateOfBirth { get; set; }
        public int Gender { get; set; }
        public string PrimaryPhone { get; set; } = default!;
        public string EmergencyContactName { get; set; } = default!;
        public string EmergencyContactPhone { get; set; } = default!;

        public Guid? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public Guid? LastModifiedBy { get; set; }
        public DateTime? LastModifiedDate { get; set; }

        // Navigation
        public User? CreatedByUser { get; set; }
        public User? LastModifiedByUser { get; set; }

        public ICollection<PatientOutcome> Outcomes { get; set; } = new List<PatientOutcome>();
    }
}
