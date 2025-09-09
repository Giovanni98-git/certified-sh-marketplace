import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contractAddress } from '../lib/wagmi'
import ABI from '@/lib/contract_abi'



export default function RegisterUser() {
  const { address } = useAccount()
  const [isRegistered, setIsRegistered] = useState(false)
  
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const handleRegister = async () => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'registerUser',
    })
  }

  if (error) {
    toast('Erreur', {
      description: error.message,
    })
  }

  if (isConfirmed && !isRegistered) {
    setIsRegistered(true)
    toast('Inscription réussie', {
      description: 'Vous êtes maintenant enregistré sur la plateforme',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enregistrement Utilisateur</CardTitle>
        <CardDescription>
          Inscrivez-vous sur la plateforme pour pouvoir utiliser toutes les fonctionnalités
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRegistered ? (
          <div className="text-green-600 font-semibold">
            ✅ Vous êtes enregistré sur la plateforme
          </div>
        ) : (
          <Button
            onClick={handleRegister}
            disabled={isPending || isConfirming}
            className="w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "S'inscrire sur la plateforme"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}