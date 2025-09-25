import React from 'react';
import type { Task } from '../types';
import { CheckIcon, ListIcon, ClockIcon, ArrowPathIcon } from './Icons';

interface DashboardProps {
  tasks: Task[];
}

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-sky-500"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-200">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const pendingTasks = tasks.filter(task => task.status === 'todo' || task.status === 'inprogress').length;
  const recurringTasks = tasks.filter(task => task.status === 'recurring').length;
  const completableTasks = tasks.filter(task => task.status !== 'recurring').length;
  const completionPercentage = completableTasks > 0 ? (completedTasks / completableTasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg space-y-6">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Dashboard</h3>
        <div className="flex justify-center">
            <CircularProgress percentage={completionPercentage} />
        </div>
        <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <ListIcon className="w-5 h-5 text-slate-500" />
                    <span>Total Tasks</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100">{totalTasks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Completed</span>
                </div>
                <span className="font-bold text-green-500">{completedTasks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                    <span>Pending</span>
                </div>
                <span className="font-bold text-yellow-500">{pendingTasks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <ArrowPathIcon className="w-5 h-5 text-violet-500" />
                    <span>Recurring</span>
                </div>
                <span className="font-bold text-violet-500">{recurringTasks}</span>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;