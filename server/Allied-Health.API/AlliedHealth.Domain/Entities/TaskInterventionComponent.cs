namespace AlliedHealth.Domain.Entities
{
    /// <summary>
    /// Stores the specific component values a clinician actually selected when
    /// assigning an intervention to a task.  Components are OPTIONAL — a task
    /// intervention can have zero, some, or all of the available components.
    /// </summary>
    public class TaskInterventionComponent
    {
        public Guid Id { get; set; }
        public Guid TaskInterventionId { get; set; }   // FK -> TaskIntervention
        public int ComponentTypeId { get; set; }        // FK -> ComponentType
        public string Value { get; set; } = default!;

        // Navigation
        public TaskIntervention TaskIntervention { get; set; } = default!;
        public ComponentType ComponentType { get; set; } = default!;
    }
}
