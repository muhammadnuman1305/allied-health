namespace AlliedHealth.Model.Entities
{
    public class Ward
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = default!;
        // If patients should belong to a ward, add a WardId in Patient; your diagram didn’t show it.
    }
}
