using AlliedHealth.Domain.Entities;

namespace AlliedHealth.Service.DTOs.AHA
{
    public class GetAHATaskDTO
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string PatientName { get; set; }
        public string Mrn { get; set; }
        public string DepartmentName { get; set; }
        public string TherapistName { get; set; }
        public int TotalInterventions { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    public class GetAHATaskSummaryDTO
    {
        public int TotalTasks { get; set; }
        public int MyTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int CompletedTasks { get; set; }
    }

    public class GetMyTasksDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string Mrn { get; set; }
        public Guid DepartmentId { get; set; }
        public string DepartmentName { get; set; }
        public string TherapistName { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }

        public List<AHATaskInterventionDTO>? Interventions { get; set; } = new List<AHATaskInterventionDTO>()!;
    }

    public class GetAHATaskDetailsDTO
    {
        public Guid Id { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string DepartmentName { get; set; }
        public string Title { get; set; }
        public int Priority { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string Diagnosis { get; set; }
        public string Goals { get; set; }
        public string Description { get; set; }
        public int TotalInterventions { get; set; }
        public DateTime? LastUpdated { get; set; }

        public List<AHATaskInterventionDTO>? Interventions { get; set; } = new List<AHATaskInterventionDTO>()!;
    }

    public class AHATaskInterventionDTO
    {
        public Guid TaskInvId { get; set; }
        public Guid WardId { get; set; }
        public string WardName { get; set; }
        public Guid InterventionId { get; set; }
        public string InterventionName { get; set; }
        public int OutcomeStatus { get; set; }
        public string? Outcome { get; set; }
        public DateOnly? OutcomeDate { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }

    public class UpdateTaskInterventionStatus
    {
        public Guid TaskInvId { get; set; }
        public int OutcomeStatus { get; set; }
        public string Outcome { get; set; }
    }
}
