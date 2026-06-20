using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShiftHandoverAPI.Data;
using ShiftHandoverAPI.Models;

namespace ShiftHandoverAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/user
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Department,
                    u.EmployeeId,
                    u.ShiftAssigned,
                    u.Batch,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/shift/{shift}
        [HttpGet("shift/{shift}")]
        public async Task<IActionResult> GetUsersByShift(string shift)
        {
            var users = await _context.Users
                .Where(u => u.ShiftAssigned == shift)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Department,
                    u.EmployeeId,
                    u.ShiftAssigned
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/user/role/{role}
        [HttpGet("role/{role}")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Department,
                    u.EmployeeId,
                    u.ShiftAssigned
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}