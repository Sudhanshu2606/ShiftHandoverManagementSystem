using System.Text.Json.Serialization;

namespace ShiftHandoverAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public int HandoverId { get; set; }

        [JsonIgnore]
        public HandoverReport? Handover { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Priority { get; set; } = "Medium"; // High, Medium, Low
        public string Status { get; set; } = "Pending";  // Pending, InProgress, Completed
        public int? AssignedTo { get; set; }
        public int CreatedBy { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? CompletedAt { get; set; }

        [JsonIgnore]
        public User? AssignedUser { get; set; }

        [JsonIgnore]
        public User? CreatedByUser { get; set; }
    }
}