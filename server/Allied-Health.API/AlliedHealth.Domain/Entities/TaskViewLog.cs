namespace AlliedHealth.Domain.Entities
{
    public class TaskViewLog
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public Guid AhaUserId { get; set; }
        public DateTime ViewedAt { get; set; }

        // Navigation
        public Task Task { get; set; } = default!;
        public User AhaUser { get; set; } = default!;
    }
}
