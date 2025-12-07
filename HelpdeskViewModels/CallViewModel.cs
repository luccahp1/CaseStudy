using HelpDeskDAL;
using System.Data;
using System.Diagnostics;
using System.Reflection;

public class CallViewModel
{
    private readonly CallDAO _dao;
    private readonly EmployeeDAO _employeeDao;
    private readonly ProblemDAO _problemDao;

    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ProblemId { get; set; }
    public string? EmployeeName { get; set; }
    public string? ProblemDescription { get; set; }
    public string? TechName { get; set; }
    public int TechId { get; set; }
    public DateTime DateOpened { get; set; }
    public DateTime? DateClosed { get; set; }
    public bool OpenStatus { get; set; }
    public string? Notes { get; set; }
    public string? Timer { get; set; }

    public CallViewModel()
    {
        _dao = new CallDAO();
        _employeeDao = new EmployeeDAO();
        _problemDao = new ProblemDAO();
    }

    public async Task Add()
    {
        Id = -1;
        try
        {
            Call call = new()
            {
                EmployeeId = EmployeeId,
                TechId = TechId,
                ProblemId = ProblemId,
                DateOpened = DateOpened,
                DateClosed = DateClosed,
                OpenStatus = OpenStatus,
                Notes = Notes
            };

            Id = await _dao.Add(call);
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Error in Add() " + ex.Message);
            throw;
        }
    }

    public async Task<int> Update()
    {
        int updateStatus;
        try
        {
           
            Call call = new()
            {
                Id = Id,
                EmployeeId = EmployeeId,
                TechId = TechId,
                ProblemId = ProblemId,
                DateOpened = DateOpened,
                DateClosed = DateClosed,
                OpenStatus = OpenStatus,
                Notes = Notes,
                Timer = Convert.FromBase64String(Timer!)
            };


            updateStatus = -1; // start out with a failed state
            updateStatus = Convert.ToInt16(await _dao.Update(call)); // overwrite status
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Problem in " + GetType().Name + " " +
                 MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
            throw;
        }
        return updateStatus;
    }

    public async Task<int> Delete()
    {
        try
        {
            return await _dao.Delete(Id);
        }
        catch (Exception ex)
        {
          
                Debug.WriteLine("Problem in " + GetType().Name + " " +
                MethodBase.GetCurrentMethod()!.Name + " " + ex.Message);
                throw;
        }
    }

    public async Task GetById()
    {
        try
        {
            var calls = await _dao.GetAll();
            var employees = await _employeeDao.GetAll();
            var problems = await _problemDao.GetAll();

            Call call = await _dao.GetById(Id);

            EmployeeId = call.EmployeeId;
            TechId = call.TechId;
            ProblemId = call.ProblemId;
            DateOpened = call.DateOpened;
            DateClosed = call.DateClosed;
            OpenStatus = call.OpenStatus;
            Notes = call.Notes;
            Timer = call.Timer != null ? Convert.ToBase64String(call.Timer) : null;
            var emp = employees.FirstOrDefault(e => e.Id == call.EmployeeId);
            var tech = employees.FirstOrDefault(e => e.Id == call.TechId);
            var problem = problems.FirstOrDefault(p => p.Id == call.ProblemId);
        }
        catch (Exception ex)
        {
            Debug.WriteLine("Error in GetById() " + ex.Message);
            throw;
        }
    }

    public async Task<List<CallViewModel>> GetAll()
    {
        List<CallViewModel> allVms = new();
        try
        {
            var calls = await _dao.GetAll();
            var employees = await _employeeDao.GetAll();
            var problems = await _problemDao.GetAll();

            foreach (var call in calls)
            {
                var emp = employees.FirstOrDefault(e => e.Id == call.EmployeeId);
                var tech = employees.FirstOrDefault(e => e.Id == call.TechId);
                var problem = problems.FirstOrDefault(p => p.Id == call.ProblemId);

                CallViewModel cvm = new()
                {
                    Id = call.Id,
                    EmployeeId = call.EmployeeId,
                    TechId = call.TechId,
                    ProblemId = call.ProblemId,
                    DateOpened = call.DateOpened,
                    DateClosed = call.DateClosed,
                    OpenStatus = call.OpenStatus,
                    Notes = call.Notes,
                    Timer = call.Timer != null ? Convert.ToBase64String(call.Timer) : null,

                    EmployeeName = emp != null ? $"{emp.FirstName} {emp.LastName}" : "not found",
                    TechName = tech != null ? $"{tech.FirstName} {tech.LastName}" : "not found",
                    ProblemDescription = problem != null ? problem.Description : "not found"
                };

                allVms.Add(cvm);
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Problem in {GetType().Name} {MethodBase.GetCurrentMethod()!.Name} {ex.Message}");
            throw;
        }

        return allVms;
    }


}
