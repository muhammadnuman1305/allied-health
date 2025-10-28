using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Domain.Entities
{
    public class Task
    {
        public Guid Id { get; set; }
        public int Type { get; set; }
        public string CustomType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public DateOnly DueDate { get; set; }
        public TimeOnly DueTime { get; set; }
        public int PatientId { get; set; }
        public int Status { get; set; }

        // Assignment fields
        public Patient Patient { get; set; } = default!;
        public ICollection<TaskIntervention> TaskInterventions { get; set; } = new List<TaskIntervention>();
    }
}
