Rails.application.routes.draw do
  get 'current_user', to: 'current_user#index'
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

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
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

      resources :beers, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get 'search'
        end
        member do
          get :bars
        end
        resources :reviews, only: [:index, :show, :create, :update, :destroy]
      end

      resources :brands, only: [:show]
      resources :events, only: [:index, :show, :create, :update, :destroy] do
        patch :upload_image, on: :member
        patch :upload_flyer, on: :member  # Ruta para subir el flyer
        collection do
          get 'search'
        end

        # Añadir rutas para event_pictures anidadas bajo events
        resources :event_pictures, only: [:index, :create]  # Para listar y crear imágenes de eventos
      end

      # Ruta para eliminar event_pictures, no anidada ya que depende del ID de la imagen
      resources :event_pictures, only: [:destroy]

      resources :users do
        collection do
          get 'search'
        end
        resources :reviews, only: [:index]
        member do
          get :friendships
          post :friendships, to: 'users#create_friendship'
          delete :friendships, to: 'users#destroy_friendship', as: 'destroy_friendship'
        end
      end

      resources :reviews, only: [:index, :show, :create, :update, :destroy]
      resources :attendances
      get 'attendances/event/:event_id', to: 'attendances#index_by_event'
    end
  end
end
