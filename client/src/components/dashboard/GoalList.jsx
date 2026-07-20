import { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Flame, 
  Target, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock
} from "lucide-react";

export default function GoalList({
  goals,
  selectedDate,
  setSelectedDate,
  todayDateStr,
  newGoalText,
  setNewGoalText,
  newGoalDuration,
  setNewGoalDuration,
  handleAddGoal,
  handleToggleGoal,
  handleDeleteGoal,
  focusedGoal,
  setFocusedGoal,
  setTimeLeft,
  setTimerLimit,
  choreError
}) {
  const getRelativeDateStr = (daysOffset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleFocusGoal = (goal) => {
    setFocusedGoal(goal);
    const seconds = (goal.duration || 25) * 60;
    setTimeLeft(seconds);
    setTimerLimit(seconds);
  };

  // Sort active goals: Shame Chores always placed at the very top
  const activeGoals = goals
    .filter(g => !g.completed)
    .sort((a, b) => (b.isShameChore ? 1 : 0) - (a.isShameChore ? 1 : 0));
  
  const shameChoresCount = activeGoals.filter(g => g.isShameChore).length;
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800/80 flex flex-col h-full">
      
      {/* Date Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-6">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-400" />
            Sprint Tasks & Goals
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedDate === todayDateStr ? "Today's Focus List" : `Goals for ${selectedDate}`}
          </p>
        </div>

        {/* Date Navigation Pill */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setSelectedDate(getRelativeDateStr(-1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition bg-transparent border-0 cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setSelectedDate(todayDateStr)}
            className={`px-3 py-1 rounded-lg text-xs font-black transition ${
              selectedDate === todayDateStr 
                ? "bg-teal-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setSelectedDate(getRelativeDateStr(1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition bg-transparent border-0 cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error Toast for Shame Chore Deletion */}
      {choreError && (
        <div className="mb-4 rounded-xl bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-300 font-bold flex items-center gap-2 animate-bounce">
          <Flame className="h-4 w-4 text-red-500 shrink-0" />
          <span>{choreError}</span>
        </div>
      )}

      {/* Quick Add Goal Form */}
      <form onSubmit={handleAddGoal} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="What will you focus on next?"
            className="flex-1 rounded-xl bg-slate-900/80 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
          />
          <select
            value={newGoalDuration}
            onChange={(e) => setNewGoalDuration(Number(e.target.value))}
            className="rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-3 text-xs font-bold text-slate-300 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value={15}>15m</option>
            <option value={25}>25m</option>
            <option value={45}>45m</option>
            <option value={60}>60m</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition cursor-pointer flex items-center justify-center shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Goal Items Container */}
      <div className="space-y-6 flex-1 overflow-y-auto max-h-[420px] pr-1">
        
        {/* Active Goals Section */}
        <div>
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            <span>Active Goals ({activeGoals.length})</span>
            {shameChoresCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-0.5 rounded-full animate-pulse">
                <Flame className="h-3 w-3" /> {shameChoresCount} Shame Chore{shameChoresCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {activeGoals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
              No active goals for this day. Add one above to start a sprint!
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeGoals.map((goal) => {
                const isFocused = focusedGoal && focusedGoal._id === goal._id;
                return (
                  <div
                    key={goal._id}
                    className={`flex items-center justify-between gap-3 rounded-2xl p-4 border transition ${
                      goal.isShameChore
                        ? "bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10"
                        : isFocused
                        ? "bg-teal-950/30 border-teal-500/50 shadow-md shadow-teal-500/10"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleGoal(goal._id, goal.completed)}
                        className="text-slate-500 hover:text-teal-400 transition bg-transparent border-0 cursor-pointer shrink-0"
                      >
                        <Circle className="h-5 w-5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-100 truncate">
                            {goal.title}
                          </span>
                          {goal.isShameChore && (
                            <span className="rounded-md bg-red-950 border border-red-800 px-2 py-0.5 text-[9px] font-black text-red-400 shrink-0 flex items-center gap-1">
                              <Flame className="h-3 w-3" /> Shame Chore
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {goal.duration || 25}m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleFocusGoal(goal)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition border cursor-pointer flex items-center gap-1 ${
                          isFocused
                            ? "bg-teal-600 text-white border-teal-500"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-teal-950/40 hover:text-teal-300 hover:border-teal-800"
                        }`}
                        title="Focus on this goal in timer"
                      >
                        <Target className="h-3.5 w-3.5" />
                        <span>{isFocused ? "Focused" : "Focus"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal._id, goal.isShameChore)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Goals Section */}
        {completedGoals.length > 0 && (
          <div className="border-t border-slate-800/80 pt-4">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              <span>Completed ({completedGoals.length})</span>
            </div>

            <div className="space-y-2">
              {completedGoals.map((goal) => (
                <div
                  key={goal._id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/30 p-3.5 border border-slate-900 text-slate-500"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleGoal(goal._id, goal.completed)}
                      className="text-teal-500 transition bg-transparent border-0 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-semibold line-through text-slate-400 truncate">
                      {goal.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal._id, goal.isShameChore)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition bg-transparent border-0 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
