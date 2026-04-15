using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data;
using TaskManagerApi.DTOs;
using TaskManagerApi.Models;

namespace TaskManagerApi.Services;

public interface ITaskService
{
    Task<IEnumerable<TaskResponse>> GetAllAsync(string userId, CancellationToken ct);
    Task<TaskResponse?> GetByIdAsync(Guid id, string userId, CancellationToken ct);
    Task<TaskResponse> CreateAsync(CreateTaskRequest request, string userId, CancellationToken ct);
    Task<TaskResponse?> UpdateAsync(Guid id, UpdateTaskRequest request, string userId, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken ct);
}

public class TaskService(ApplicationDbContext db) : ITaskService
{
    public async Task<IEnumerable<TaskResponse>> GetAllAsync(string userId, CancellationToken ct) =>
        await db.Tasks.AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync(ct);

    public async Task<TaskResponse?> GetByIdAsync(Guid id, string userId, CancellationToken ct)
    {
        var task = await db.Tasks.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        return task is null ? null : ToResponse(task);
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request, string userId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var entity = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            IsCompleted = false,
            DueDate = request.DueDate,
            CreatedAt = now,
            UpdatedAt = now,
            UserId = userId
        };

        db.Tasks.Add(entity);
        await db.SaveChangesAsync(ct);
        return ToResponse(entity);
    }

    public async Task<TaskResponse?> UpdateAsync(Guid id, UpdateTaskRequest request, string userId, CancellationToken ct)
    {
        var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        if (entity is null) return null;

        entity.Title = request.Title.Trim();
        entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        entity.IsCompleted = request.IsCompleted;
        entity.DueDate = request.DueDate;
        entity.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return ToResponse(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken ct)
    {
        var entity = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId, ct);
        if (entity is null) return false;

        db.Tasks.Remove(entity);
        await db.SaveChangesAsync(ct);
        return true;
    }

    private static TaskResponse ToResponse(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        IsCompleted = t.IsCompleted,
        DueDate = t.DueDate,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
