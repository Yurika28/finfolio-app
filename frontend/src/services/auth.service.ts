import api from './api'
import type { IAuthResponse, ILoginPayload, IRegisterPayload, IUser } from '@/types/api.types'

export const authService = {
  register: (data: IRegisterPayload) => api.post<IAuthResponse>('/api/auth/register', data),
  login:    (data: ILoginPayload)    => api.post<IAuthResponse>('/api/auth/login', data),
  me:       ()                       => api.get<IUser>('/api/auth/me'),
}
