namespace AlliedHealth.Service.DTOs
{
    public class GetTaskDTO
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public int Priority { get; set; }
        public int Severity { get; set; }
        public int RequiredRepetitions { get; set; }
        public int CompletedRepetitions { get; set; }
        public DateOnly? LastReviewDate { get; set; }
        public string? TaskType { get; set; }
        public int Status { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
        public string? CreatedByName { get; set; }
        public Guid? CreatedById { get; set; }
    }

    public class GetTaskDetailsDTO
    {
        public Guid Id { get; set; }
        public int PatientId { get; set; }
        public Guid DepartmentId { get; set; }
        public required string Title { get; set; }
        public int Priority { get; set; }
        public int Severity { get; set; }
        public int RequiredRepetitions { get; set; }
        public int CompletedRepetitions { get; set; }
        public DateOnly? LastReviewDate { get; set; }
        public string? TaskType { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public DateTime? LastUpdated { get; set; }
        public bool Hidden { get; set; }
        public string? CreatedByName { get; set; }
        public Guid? CreatedById { get; set; }

        public List<TaskInterventionDTO> Interventions { get; set; } = new List<TaskInterventionDTO>();
        public List<TaskViewLogDTO> ViewLogs { get; set; } = new List<TaskViewLogDTO>();
    }

    public class GetReferralTaskDetailsDTO
    {
        public Guid RefId { get; set; }
        public int PatientId { get; set; }
        public Guid DepartmentId { get; set; }
        public int Priority { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public List<Guid> Interventions { get; set; } = new List<Guid>();
    }

    public class SelectIntervention
    {
        public Guid InterventionId { get; set; }
        public Guid SpecialtyId { get; set; }
    }

    public class GetTaskSummaryDTO
    {
        public int TotalTasks { get; set; }
        public int OverdueTasks { get; set; }
        public int ActiveTasks { get; set; }
        public int CompletedTasks { get; set; }

        // Priority Distribution
        public int CriticalPriority { get; set; }
        public int HighPriority { get; set; }
        public int MidPriority { get; set; }
        public int LowPriority { get; set; }
        public List<DeptTaskSummary> DeptWiseSummary { get; set; } = new List<DeptTaskSummary>();
    }

    public class DeptTaskSummary
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }

    public class AddUpdateTaskDTO
    {
        public Guid? Id { get; set; }
        public Guid? RefId { get; set; }

        // Task Details
        public int PatientId { get; set; }
        public Guid DepartmentId { get; set; }
        public string Title { get; set; }
        public int Priority { get; set; }
        public int Severity { get; set; } = 1;
        public int RequiredRepetitions { get; set; } = 0;
        public DateOnly? LastReviewDate { get; set; }
        public string? TaskType { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string? Description { get; set; }

        public List<TaskInterventionDTO> Interventions { get; set; }
    }

    public class TaskViewLogDTO
    {
        public Guid AhaUserId { get; set; }
        public string AhaName { get; set; } = default!;
        public DateTime ViewedAt { get; set; }
    }

    public class AutoAssignInterventionItem
    {
        public Guid Id { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class AutoAssignRequestDTO
    {
        public List<AutoAssignInterventionItem> Interventions { get; set; } = new();
        public DateOnly TaskStartDate { get; set; }
        public DateOnly TaskEndDate { get; set; }
        public Guid? DepartmentId { get; set; }
    }

    public class AutoAssignResultDTO
    {
        public Guid InterventionId { get; set; }
        public string InterventionName { get; set; }
        public Guid? SuggestedAhaId { get; set; }
        public string? SuggestedAhaName { get; set; }
        public Guid? SuggestedWardId { get; set; }
        public string? SuggestedWardName { get; set; }
        public int CurrentDaySlots { get; set; }
        public bool CanAssign { get; set; }
    }

    public class TaskInterventionDTO
    {
        public Guid Id { get; set; }
        public Guid AhaId { get; set; }
        public Guid WardId { get; set; }
        public DateOnly Start { get; set; }
        public DateOnly End { get; set; }

        /// <summary>
        /// Components the clinician selected for this intervention on this task.
        /// Zero or more entries — always optional.
        /// </summary>
        public List<SelectedComponentDTO> Components { get; set; } = new List<SelectedComponentDTO>();
    }

    /// <summary>
    /// A single component value selected by a clinician when assigning an
    /// intervention to a task (e.g. Technique = "Hoist transfer").
    /// </summary>
    public class SelectedComponentDTO
    {
        public string ComponentType { get; set; } = default!;
        public string Value { get; set; } = default!;
    }
}
