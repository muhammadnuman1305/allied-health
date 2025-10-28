namespace AlliedHealth.Domain.Entities
{
    public class TaskIntervention
    {
        public Guid TaskId { get; set; }                 // FK -> Task
        public int InterventionId { get; set; }          // FK -> Intervention

        // Navigation
        public Task Task { get; set; } = default!;
        public Intervention Intervention { get; set; } = default!;
    }
}
