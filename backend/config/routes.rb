Rails.application.routes.draw do
  # Ruta para obtener el usuario actual
  get 'current_user', to: 'current_user#index'

  # Rutas de Devise personalizadas para autenticación
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # API V1
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      
      # Rutas para bares
      resources :bars do
        collection do
          get 'search'
        end
        member do
          get :beers
          get :addresses
          get :countrys 
        end
      end

      # Rutas para cervezas
      resources :beers, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get 'search'
        end
        member do
          get :bars
        end
        # Rutas anidadas para reviews de cervezas
        resources :reviews, only: [:index, :show, :create, :update, :destroy]
      end

      # Ruta para marcas
      resources :brands, only: [:show]

      # Rutas para eventos
      resources :events, only: [:index, :show, :create, :update, :destroy] do
        patch :upload_image, on: :member
        patch :upload_flyer, on: :member  # Ruta para subir el flyer

        collection do
          get 'search'
        end

        # Rutas anidadas para event_pictures dentro de eventos
        resources :event_pictures, only: [:index, :create]  # Para listar y crear imágenes de eventos
      end

      # Ruta para eliminar event_pictures de manera independiente (por ID)
      resources :event_pictures, only: [:destroy]

      # Rutas para usuarios
      resources :users do
        collection do
          get 'search'
        end

        # Rutas anidadas para reviews de usuarios
        resources :reviews, only: [:index]

        # Rutas de amistad
        member do
          get :friendships
          post :friendships, to: 'users#create_friendship'
          delete :friendships, to: 'users#destroy_friendship', as: 'destroy_friendship'
        end
      end

      # Rutas para reviews generales
      resources :reviews, only: [:index, :show, :create, :update, :destroy]

      # Rutas para asistencias (attendances)
      resources :attendances do
        collection do
          get 'event/:event_id', to: 'attendances#index_by_event'  # Ruta personalizada para listar asistencias por evento
        end
      end
    end
  end
end
