namespace AlliedHealth.Domain.Entities
{
    public class InterventionComponent
    {
        public Guid Id { get; set; }
        public Guid InterventionId { get; set; }
        public int ComponentTypeId { get; set; }
        public string Value { get; set; } = default!;

        // Navigation
        public Intervention Intervention { get; set; } = default!;
        public ComponentType ComponentType { get; set; } = default!;
    }
}
