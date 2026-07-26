namespace Pos.Application.Repositories
{
    public interface IRepository<T> where T : class
    {
        IQueryable<T> GetAll();
        Task AddAsync(T? entity);
        Task UpdateAsync(T? entity);
        Task DeleteAsync(T? entity);
        Task DeleteRangeAsync(IEnumerable<T> entities);
        Task<T?> FindAsync(Guid id);
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}