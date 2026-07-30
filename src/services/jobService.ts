import { jobRepo } from '@/services/repositories'
import type { Job, JobStatus, JobWorker, JobMaterialNote, JobDocumentation, JobTimelineItem, Role } from '@/types'

function getFormattedTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.')
}

export const jobService = {
  async getJobs(role: Role, userId: string): Promise<Job[]> {
    if (role === 'vendor') {
      return jobRepo.getByVendor(userId)
    }
    if (role === 'itsupport' || role === 'leaderit') {
      return jobRepo.getAll()
    }
    return []
  },

  async getJob(id: string): Promise<Job | null> {
    return jobRepo.getById(id)
  },

  async createJob(data: Omit<Job, 'id' | 'status' | 'timeline' | 'documentation' | 'materials' | 'extensionRequests' | 'ratings'>): Promise<Job> {
    const time = getFormattedTime()
    const initialTimeline: JobTimelineItem[] = [
      {
        id: `tl-${Date.now()}-1`,
        time,
        activity: `Job created by Leader IT ${data.leaderName}`,
      },
    ]

    return jobRepo.create({
      ...data,
      status: 'Pending',
      timeline: initialTimeline,
      documentation: [],
      materials: [],
      extensionRequests: [],
      ratings: [],
    })
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const time = getFormattedTime()
    let activity = `Job status updated to ${status}`
    if (status === 'In Progress') {
      activity = 'Vendor started working'
    } else if (status === 'Completed') {
      activity = 'Job Completed'
    } else if (status === 'Cancelled') {
      activity = 'Job cancelled'
    } else if (status === 'Approved') {
      activity = 'Job approved to start'
    }

    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity,
      },
    ]

    return jobRepo.update(id, {
      status,
      timeline: updatedTimeline,
    })
  },

  async updateWorkersAttendance(id: string, workers: JobWorker[]): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: 'Worker attendance updated',
      },
    ]

    return jobRepo.update(id, {
      workers,
      timeline: updatedTimeline,
    })
  },

  async addMaterialNote(
    id: string,
    material: Omit<JobMaterialNote, 'id' | 'createdAt'>
  ): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const newMaterial: JobMaterialNote = {
      ...material,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Material added: ${newMaterial.materialName} (${newMaterial.quantity} ${newMaterial.unit})`,
      },
    ]

    return jobRepo.update(id, {
      materials: [...job.materials, newMaterial],
      timeline: updatedTimeline,
    })
  },

  async uploadDocumentation(
    id: string,
    doc: Omit<JobDocumentation, 'id' | 'uploadedAt'>
  ): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const newDoc: JobDocumentation = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    }

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Progress photo uploaded (${doc.type}) by ${doc.uploadedBy}`,
      },
    ]

    return jobRepo.update(id, {
      documentation: [...job.documentation, newDoc],
      timeline: updatedTimeline,
    })
  },

  async requestExtension(id: string, reason: string, additionalDays: number): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const newRequest = {
      id: `req-${Date.now()}`,
      reason,
      additionalDays,
      status: 'Pending' as const,
      requestedAt: new Date().toISOString(),
    }

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Extension requested: +${additionalDays} days (${reason})`,
      },
    ]

    return jobRepo.update(id, {
      status: 'Need Extension',
      extensionRequests: [...job.extensionRequests, newRequest],
      timeline: updatedTimeline,
    })
  },

  async approveExtension(id: string, requestId: string): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const requests = job.extensionRequests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: 'Approved' as const }
      }
      return r
    })

    const request = job.extensionRequests.find((r) => r.id === requestId)
    const daysToAdd = request ? request.additionalDays : 0

    // Add days to deadline
    const deadlineDate = new Date(job.deadline)
    deadlineDate.setDate(deadlineDate.getDate() + daysToAdd)
    const newDeadline = deadlineDate.toISOString().split('T')[0]

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Leader approved extension: +${daysToAdd} days. New deadline: ${newDeadline}`,
      },
    ]

    return jobRepo.update(id, {
      status: 'In Progress',
      deadline: newDeadline,
      extensionRequests: requests,
      timeline: updatedTimeline,
    })
  },

  async rejectExtension(id: string, requestId: string, reason: string, whatsapp: string): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const requests = job.extensionRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Rejected' as const,
          rejectReason: reason,
          rejectWhatsApp: whatsapp,
        }
      }
      return r
    })

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Leader rejected extension. Reason: ${reason} (WhatsApp: ${whatsapp})`,
      },
    ]

    return jobRepo.update(id, {
      status: 'In Progress', // Revert back to In Progress
      extensionRequests: requests,
      timeline: updatedTimeline,
    })
  },

  async submitRating(id: string, rating: number, comment: string, byRole: 'vendor' | 'itsupport'): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const newRating = {
      rating,
      comment,
      date: new Date().toISOString(),
      byRole,
      isPublic: false, // Default is internal
    }

    const time = getFormattedTime()
    const updatedTimeline = [
      ...job.timeline,
      {
        id: `tl-${Date.now()}`,
        time,
        activity: `Rating submitted by ${byRole === 'vendor' ? 'Vendor' : 'IT Support'}`,
      },
    ]

    return jobRepo.update(id, {
      ratings: [...job.ratings, newRating],
      timeline: updatedTimeline,
    })
  },

  async updateRatingVisibility(id: string, ratingIndex: number, isPublic: boolean): Promise<Job> {
    const job = await jobRepo.getById(id)
    if (!job) throw new Error('Job not found')

    const updatedRatings = [...job.ratings]
    if (updatedRatings[ratingIndex]) {
      updatedRatings[ratingIndex].isPublic = isPublic
    }

    return jobRepo.update(id, {
      ratings: updatedRatings,
    })
  },
}
