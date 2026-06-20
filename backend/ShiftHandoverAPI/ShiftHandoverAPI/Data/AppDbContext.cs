using Microsoft.EntityFrameworkCore;
using ShiftHandoverAPI.Models;

namespace ShiftHandoverAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<HandoverReport> HandoverReports { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Issue> Issues { get; set; }
    }
}