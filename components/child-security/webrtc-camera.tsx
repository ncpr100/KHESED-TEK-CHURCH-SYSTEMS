
'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Camera, CameraOff, RotateCcw, Check, AlertTriangle } from 'lucide-react'

interface WebRTCCameraProps {
  onPhotoCapture: (photo: string, type: 'child' | 'parent') => void
  captureType: 'child' | 'parent'
  isActive: boolean
  className?: string
}

export function WebRTCCamera({ onPhotoCapture, captureType, isActive, className }: WebRTCCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment', // Rear-facing camera for taking photos of subjects
          frameRate: { ideal: 15 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsStreaming(true)
      }

    } catch (err) {
      console.error('Camera error:', err)
      setError('No se pudo acceder a la cámara. Verifique los permisos.')
      setIsStreaming(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const photoData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedPhoto(photoData)
    
    // Stop camera after capture
    stopCamera()
    
    // Notify parent component
    onPhotoCapture(photoData, captureType)
    setIsCapturing(false)
  }, [captureType, onPhotoCapture, stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
    startCamera()
  }, [startCamera])

  useEffect(() => {
    if (isActive && !capturedPhoto) {
      startCamera()
    } else if (!isActive) {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive, capturedPhoto, startCamera, stopCamera])

  const getCameraTitle = () => {
    switch (captureType) {
      case 'child':
        return 'Foto del Niño/a'
      case 'parent':
        return 'Foto del Padre/Madre'
      default:
        return 'Captura de Foto'
    }
  }

  const getCameraDescription = () => {
    switch (captureType) {
      case 'child':
        return 'Tome una foto clara del rostro del niño/a para verificación de identidad'
      case 'parent':
        return 'Tome una foto clara de quien recogerá al niño/a'
      default:
        return 'Capture una foto para verificación'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {getCameraTitle()}
          {capturedPhoto && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Check className="h-3 w-3 mr-1" />
              Capturada
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{getCameraDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!capturedPhoto ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {isStreaming && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    size="lg"
                    className="rounded-full h-16 w-16 bg-white text-black hover:bg-gray-200"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              )}

              {!isStreaming && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startCamera} variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Activar Cámara
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <img
                src={capturedPhoto}
                alt="Foto capturada"
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Tomar Nueva Foto
                </Button>
              </div>
            </>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Camera controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Cámara Activa
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                <CameraOff className="h-3 w-3 mr-2" />
                Cámara Inactiva
              </Badge>
            )}
          </div>
          
          {isStreaming && (
            <Button onClick={stopCamera} variant="outline" size="sm">
              <CameraOff className="h-4 w-4 mr-2" />
              Detener
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Las fotos se almacenan de forma cifrada y se eliminan automáticamente después de 7 días.
            Solo el personal autorizado puede acceder a estas imágenes.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
