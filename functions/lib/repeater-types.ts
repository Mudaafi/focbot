// See: https://docs.repeater.dev/
export interface RepeaterJobResults {
  status: number // The HTTP status code in the response
  headers: string // Any headers returned with the response
  body: string // Any body in the response
  runAt: number // An ISO8601 timestamp of when the Job was run which created this JobResult. Note that due to Runner backlog this time could be later than the runAt field set on the Job itself.
  run: number // A counter that is incremented every time the parent Job was run (either a recurring Job or a single-run Job that has been updated to run multiple times)
  duration: number // The number of milliseconds it took to receive the response
  createdAt: number // An ISO8601 timestamp of when the JobResult was created
  updatedAt: number // An ISO8601 timestamp of when the JobResult was last updated
  job: RepeaterJob // Details for the Job this JobResult is attached to.
}

export interface RepeaterCreateJob {
  applicationName?: string
  name: string
  enabled?: boolean
  endpoint: string // The URL that will be requested. The request engine will follow redirects (3XX status codes) until a 2XX or 4XX-5XX code is returned.
  verb: string // The HTTP verb to make the request with. One of GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
  headers?: string
  body?: string
  retryable?: boolean // Whether the Job should be retried if it fails. If so, the Job is tried again on a backoff schedule of N ** 4 seconds, where N is the number of previous attempts. Maximum of 24 retries. If the Job is recurring then retrying will follow this schedule, otherwise the next run of a failed Job will occur on the regular schedule.
  runAt: Date
  runEvery?: number // An ISO8601 duration of the recurring schedule for the Job. Ex: P1D would run once per day, starting at the runAt time. If null then the Job will only run once at the runAt time.
}

export interface RepeaterUpdateJob {
  applicationName?: string
  name?: string
  enabled?: boolean
  endpoint?: string // The URL that will be requested. The request engine will follow redirects (3XX status codes) until a 2XX or 4XX-5XX code is returned.
  verb?: string // The HTTP verb to make the request with. One of GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
  headers?: string
  body?: string
  retryable?: boolean // Whether the Job should be retried if it fails. If so, the Job is tried again on a backoff schedule of N ** 4 seconds, where N is the number of previous attempts. Maximum of 24 retries. If the Job is recurring then retrying will follow this schedule, otherwise the next run of a failed Job will occur on the regular schedule.
  runAt?: Date
  runEvery?: number // An ISO8601 duration of the recurring schedule for the Job. Ex: P1D would run once per day, starting at the runAt time. If null then the Job will only run once at the runAt time.
}

export interface RepeaterJob {
  name: string
  enabled: boolean
  endpoint: string // The URL that will be requested. The request engine will follow redirects (3XX status codes) until a 2XX or 4XX-5XX code is returned.
  verb: string // The HTTP verb to make the request with. One of GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
  headers: string
  body: string
  retryable: boolean // Whether the Job should be retried if it fails. If so, the Job is tried again on a backoff schedule of N ** 4 seconds, where N is the number of previous attempts. Maximum of 24 retries. If the Job is recurring then retrying will follow this schedule, otherwise the next run of a failed Job will occur on the regular schedule
  runAt: number // ISO8601 Timestamp
  runEvery: number // ISO8601 Timestamp
  createdAt: number // ISO8601 Timestamp
  updatedAt: number // ISO8601 Timestamp
  lastRunAt: number // ISO8601 Timestamp
  nextRunAt: number // ISO8601 Timestamp
  successCount: number
  failureCount: number
  application: RepeaterApplication
  jobResult: [RepeaterJobResults] | undefined
  // runners: [RepeaterRunner] ! Missing in docs
}

export interface RepeaterApplication {
  name: string
  token: string
  createdAt: number // ISO8601 Timestamp
  updatedAt: number // ISO8601 Timestamp
  jobsCount: number
  scheduledJobsCount: number
}
