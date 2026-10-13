create extension if not exists "uuid-ossp";


-- ============================================================
-- STUDENTS
-- ============================================================

create table if not exists students (
    id uuid primary key default uuid_generate_v4(),

    name text not null,

    email text unique not null,

    department text not null,

    year integer not null,

    role text not null default 'student'
        check (role in ('admin', 'student')),

    created_at timestamptz default now()
);


-- ============================================================
-- WEEKLY METRICS
-- ============================================================

create table if not exists weekly_metrics (
    id uuid primary key default uuid_generate_v4(),

    student_id uuid not null
        references students(id)
        on delete cascade,

    week integer not null,

    attendance numeric not null
        check (attendance >= 0 and attendance <= 100),

    marks numeric not null
        check (marks >= 0 and marks <= 100),

    assignment_completion numeric not null
        check (
            assignment_completion >= 0
            and assignment_completion <= 100
        ),

    participation numeric not null
        check (
            participation >= 0
            and participation <= 100
        ),

    gpa numeric not null
        check (gpa >= 0 and gpa <= 10),

    backlogs integer not null default 0
        check (backlogs >= 0),

    created_at timestamptz default now(),

    unique(student_id, week)
);


-- ============================================================
-- PREDICTIONS
-- ============================================================

create table if not exists predictions (
    id uuid primary key default uuid_generate_v4(),

    student_id uuid not null
        references students(id)
        on delete cascade,

    weekly_metric_id uuid
        references weekly_metrics(id)
        on delete cascade,

    risk_level text not null
        check (risk_level in ('Low', 'Medium', 'High')),

    predicted_class text not null
        check (
            predicted_class in (
                'Dropout',
                'Enrolled',
                'Graduate'
            )
        ),

    confidence numeric not null
        check (
            confidence >= 0
            and confidence <= 1
        ),

    risk_score numeric not null
        check (
            risk_score >= 0
            and risk_score <= 100
        ),

    top_factors jsonb default '[]'::jsonb,

    protective_factors jsonb default '[]'::jsonb,

    created_at timestamptz default now()
);


-- ============================================================
-- INTERVENTIONS
-- ============================================================

create table if not exists interventions (
    id uuid primary key default uuid_generate_v4(),

    student_id uuid not null
        references students(id)
        on delete cascade,

    state text not null
        check (
            state in (
                'Not contacted',
                'Message sent',
                'Meeting scheduled',
                'Support accepted',
                'No response',
                'Recovered',
                'Escalated'
            )
        ),

    owner text,

    next_review_date date,

    created_at timestamptz default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_weekly_metrics_student
on weekly_metrics(student_id);

create index if not exists idx_predictions_student
on predictions(student_id);

create index if not exists idx_interventions_student
on interventions(student_id);

create index if not exists idx_predictions_created
on predictions(created_at);

create index if not exists idx_interventions_created
on interventions(created_at);