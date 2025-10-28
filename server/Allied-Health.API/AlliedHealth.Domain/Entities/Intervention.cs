namespace AlliedHealth.Domain.Entities
{
    public class Intervention
    {
        public int InterventionId { get; set; }           // PK
        public int SpecialtyId { get; set; }              // FK -> Specialty
        public string Name { get; set; } = default!;      // e.g. "Mobilisation"
        public bool IsActive { get; set; } = true;

        // Navigation
        public Specialty Specialty { get; set; } = default!;
        public ICollection<TaskIntervention> TaskInterventions { get; set; } = new List<TaskIntervention>();
    }
}
