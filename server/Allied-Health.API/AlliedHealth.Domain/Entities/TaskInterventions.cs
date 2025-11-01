namespace AlliedHealth.Domain.Entities
{
    public class TaskIntervention
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }                 // FK -> Task
        public Guid InterventionId { get; set; }          // FK -> Intervention
        public Guid AhaId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public Guid WardId { get; set; }
        public int Status { get; set; }


        // Navigation
        public Task Task { get; set; } = default!;
        public Intervention Intervention { get; set; } = default!;
    }
}
