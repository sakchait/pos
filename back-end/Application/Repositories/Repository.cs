using Microsoft.EntityFrameworkCore;
using Pos.Domain.Persistence;

namespace Pos.Application.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly string _userId = string.Empty;
        protected readonly string _userName = string.Empty;
        internal DbSet<T> dbSet;

        public Repository(
            ApplicationDbContext context)
        {
            _context = context;
            dbSet = _context.Set<T>();
        }

        public virtual IQueryable<T> GetAll()
        {
            return dbSet.AsNoTracking();
        }

        public virtual async Task AddAsync(T? entity)
        {
            if (entity != null)
            {
                dbSet.Add(entity);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Unable to process, entity is null");
            }
        }

        public virtual async Task UpdateAsync(T? entity)
        {
            if (entity != null)
            {
                dbSet.Update(entity);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Unable to process, entity is null");
            }
        }

        public virtual async Task DeleteAsync(T? entity)
        {
            if (entity != null)
            {
                dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Unable to process, entity is null");
            }
        }

        public virtual async Task DeleteRangeAsync(IEnumerable<T> entities)
        {
            if (entities != null)
            {
                dbSet.RemoveRange(entities);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Unable to process, entities is null");
            }
        }

        public Task<T?> FindAsync(Guid id)
        {
            return dbSet.FindAsync(id).AsTask();
        }
        public virtual Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}