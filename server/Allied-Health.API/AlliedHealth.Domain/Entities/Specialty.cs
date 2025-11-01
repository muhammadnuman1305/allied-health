namespace AlliedHealth.Domain.Entities
{
    public class Specialty
    {
        public Guid Id { get; set; }                  // Primary Key
        public string Name { get; set; } = default!;  // e.g. Physiotherapy, Dietetics
        public string? Description { get; set; }      // Optional: overview or purpose of specialty

        // Audit fields
        public DateTime CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
        public bool Hidden { get; set; } = false;

        // Navigation
        public ICollection<Intervention> Interventions { get; set; } = new List<Intervention>();
        public ICollection<UserSpecialty> UserSpecialties { get; set; } = new List<UserSpecialty>();
    }
}
