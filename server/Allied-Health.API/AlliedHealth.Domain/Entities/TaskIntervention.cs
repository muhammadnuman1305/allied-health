namespace AlliedHealth.Domain.Entities
{
    public class TaskIntervention
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }                 // FK -> Task
        public Guid InterventionId { get; set; }          // FK -> Intervention
        public Guid AhaUserId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public Guid WardId { get; set; }
        public int OutcomeStatus { get; set; }
        public string? Outcome { get; set; }
        public DateOnly? OutcomeDate { get; set; }



        // Navigation
        public Ward Ward { get; set; } = default!;
        public User AhaUser { get; set; }
        public Task Task { get; set; } = default!;
        public Intervention Intervention { get; set; } = default!;
    }
}
