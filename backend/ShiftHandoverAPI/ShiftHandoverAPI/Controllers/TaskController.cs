using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiftHandoverAPI.Data;
using ShiftHandoverAPI.Models;
using System.Security.Claims;

namespace ShiftHandoverAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/task/handover/{handoverId}
        [HttpGet("handover/{handoverId}")]
        public async Task<IActionResult> GetByHandover(int handoverId)
        {
            try
            {
                var tasks = await _context.Tasks
                    .Where(t => t.HandoverId == handoverId)
                    .Include(t => t.AssignedUser)
                    .Include(t => t.CreatedByUser)
                    .OrderByDescending(t => t.Priority)
                    .ToListAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/task/all
        [HttpGet("all")]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> GetAllTasks()
        {
            try
            {
                var tasks = await _context.Tasks
                    .Include(t => t.AssignedUser)
                    .Include(t => t.CreatedByUser)
                    .Include(t => t.Handover)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/task/my-tasks
        [HttpGet("my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"GetMyTasks called for User ID: {userId}");

                var tasks = await _context.Tasks
                    .Where(t => t.AssignedTo == userId)
                    .Include(t => t.Handover)
                    .Include(t => t.CreatedByUser)
                    .Include(t => t.AssignedUser)
                    .OrderByDescending(t => t.Priority)
                    .ToListAsync();

                Console.WriteLine($"Found {tasks.Count} tasks for user {userId}");
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMyTasks: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/task
        [HttpPost]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> Create([FromBody] TaskItem task)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                task.CreatedBy = userId;
                task.CreatedAt = DateTime.Now;
                task.Status = "Pending";

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                var createdTask = await _context.Tasks
                    .Include(t => t.AssignedUser)
                    .Include(t => t.CreatedByUser)
                    .FirstOrDefaultAsync(t => t.Id == task.Id);

                return Ok(createdTask);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/task/{id}/status - FIXED
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                Console.WriteLine($"UpdateStatus called for Task ID: {id}, New Status: {status}");

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    Console.WriteLine($"Task {id} not found");
                    return NotFound(new { message = "Task not found" });
                }

                Console.WriteLine($"Task before update: Status={task.Status}, AssignedTo={task.AssignedTo}");

                task.Status = status;
                if (status == "Completed")
                {
                    task.CompletedAt = DateTime.Now;
                }
                await _context.SaveChangesAsync();

                Console.WriteLine($"Task after update: Status={task.Status}");
                return Ok(task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateStatus: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/task/{id}/reassign
        [HttpPut("{id}/reassign")]
        [Authorize(Roles = "Admin,Supervisor")]
        public async Task<IActionResult> Reassign(int id, [FromBody] int newAssignedTo)
        {
            try
            {
                Console.WriteLine($"Reassign called for Task ID: {id}, New Assignee: {newAssignedTo}");

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    Console.WriteLine($"Task {id} not found");
                    return NotFound(new { message = "Task not found" });
                }

                var assignedUser = await _context.Users.FindAsync(newAssignedTo);
                if (assignedUser == null)
                {
                    Console.WriteLine($"User {newAssignedTo} not found");
                    return BadRequest(new { message = "User not found" });
                }

                Console.WriteLine($"Task before reassign: AssignedTo={task.AssignedTo}");

                task.AssignedTo = newAssignedTo;
                task.Status = "Pending";
                await _context.SaveChangesAsync();

                Console.WriteLine($"Task after reassign: AssignedTo={task.AssignedTo}");

                var updatedTask = await _context.Tasks
                    .Include(t => t.AssignedUser)
                    .Include(t => t.CreatedByUser)
                    .FirstOrDefaultAsync(t => t.Id == id);

                return Ok(updatedTask);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Reassign: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/task/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    Console.WriteLine($"Task {id} not found for deletion");
                    return NotFound(new { message = "Task not found" });
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Task {id} deleted successfully");
                return Ok(new { message = "Task deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in Delete: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}