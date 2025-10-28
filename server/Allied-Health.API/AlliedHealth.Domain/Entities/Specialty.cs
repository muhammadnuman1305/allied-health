namespace AlliedHealth.Domain.Entities
{
    public class Specialty
    {
        public int SpecialtyId { get; set; }              // PK
        public string Name { get; set; } = default!;      // Physiotherapy, Dietetics, etc.

        // Navigation
        public ICollection<Intervention> Interventions { get; set; } = new List<Intervention>();
    }
}
