import { supabase } from './supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Campaign {
  id: string
  user_id: string
  title: string
  description?: string
  banner_url: string
  banner_width: number
  banner_height: number
  placeholder_x: number
  placeholder_y: number
  placeholder_width: number
  placeholder_height: number
  placeholder_shape: 'rectangle' | 'circle'
  status: 'draft' | 'active' | 'archived'
  views: number
  downloads: number
  share_token: string
  created_at: string
  updated_at: string
}

export interface CreateCampaignData {
  title: string
  description?: string
  banner_url: string
  banner_width: number
  banner_height: number
  placeholder_x: number
  placeholder_y: number
  placeholder_width: number
  placeholder_height: number
  placeholder_shape: 'rectangle' | 'circle'
  status?: 'draft' | 'active' | 'archived'
}

export interface CampaignParticipant {
  id: string
  campaign_id: string
  user_email: string
  user_name?: string
  photo_url?: string
  photo_position_x?: number
  photo_position_y?: number
  photo_scale?: number
  photo_rotation?: number
  downloaded_at: string
  created_at: string
}

// Campaign service functions
export const campaignService = {
  // Create a new campaign
  async createCampaign(data: CreateCampaignData): Promise<{ data: Campaign | null; error: any }> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    return { data: campaign, error }
  },

  // Get campaigns for the current user
  async getUserCampaigns(): Promise<{ data: Campaign[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return { data: campaigns, error }
  },

  // Get campaign by share token (public access)
  async getCampaignByShareToken(shareToken: string): Promise<{ data: Campaign | null; error: any }> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('share_token', shareToken)
      .eq('status', 'active') // Only allow access to active campaigns
      .single()

    // Increment view count when someone visits the campaign
    if (campaign && !error) {
      await supabase
        .from('campaigns')
        .update({ views: campaign.views + 1 })
        .eq('id', campaign.id)
    }

    return { data: campaign, error }
  },

  // Get a campaign by ID
  async getCampaign(id: string): Promise<{ data: Campaign | null; error: any }> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    return { data: campaign, error }
  },

  // Get a campaign by share token (for public access)
  async getCampaignByShareToken(shareToken: string): Promise<{ data: Campaign | null; error: any }> {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('share_token', shareToken)
      .eq('status', 'active')
      .single()

    return { data: campaign, error }
  },

  // Update a campaign
  async updateCampaign(id: string, updates: Partial<CreateCampaignData>): Promise<{ data: Campaign | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } }
    }

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data: campaign, error }
  },

  // Delete a campaign
  async deleteCampaign(id: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'User not authenticated' } }
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return { error }
  },

  // Increment campaign views
  async incrementViews(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('campaigns')
      .update({ views: supabase.rpc('increment', { row_id: id, increment_amount: 1 }) })
      .eq('id', id)

    return { error }
  },

  // Increment campaign downloads
  async incrementDownloads(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('campaigns')
      .update({ downloads: supabase.rpc('increment', { row_id: id, increment_amount: 1 }) })
      .eq('id', id)

    return { error }
  },

  // Update campaign status (useful for activating draft campaigns)
  async updateCampaignStatus(campaignId: string, status: 'draft' | 'active' | 'archived'): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: { message: 'User not authenticated' } }
    }

    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId)
      .eq('user_id', user.id)

    return { error }
  },

  // Add a participant to a campaign
  async addParticipant(campaignId: string, participantData: {
    user_email: string
    user_name?: string
    photo_url?: string
    photo_position_x?: number
    photo_position_y?: number
    photo_scale?: number
    photo_rotation?: number
  }): Promise<{ data: CampaignParticipant | null; error: any }> {
    const { data: participant, error } = await supabase
      .from('campaign_participants')
      .insert({
        campaign_id: campaignId,
        ...participantData
      })
      .select()
      .single()

    return { data: participant, error }
  },

  // Get participants for a campaign
  async getCampaignParticipants(campaignId: string): Promise<{ data: CampaignParticipant[] | null; error: any }> {
    const { data: participants, error } = await supabase
      .from('campaign_participants')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    return { data: participants, error }
  }
}

// Storage service for handling file uploads
export const storageService = {
  // Upload a campaign banner
  async uploadBanner(file: File, campaignId: string): Promise<{ data: string | null; error: any }> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${campaignId}-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('campaign-banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { data: null, error }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('campaign-banners')
      .getPublicUrl(fileName)

    return { data: publicUrl, error: null }
  },

  // Delete a campaign banner
  async deleteBanner(fileName: string): Promise<{ error: any }> {
    const { error } = await supabase.storage
      .from('campaign-banners')
      .remove([fileName])

    return { error }
  }
}
