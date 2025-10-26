using AlliedHealth.Model.Entities;

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

        // Assignment fields
        public ICollection<TaskIntervention> TaskInterventions { get; set; } = new List<TaskIntervention>();

    }
}
