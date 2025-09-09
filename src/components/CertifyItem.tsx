import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contractAddress } from '../lib/wagmi'
import ABI from '@/lib/contract_abi'



export default function CertifyItem() {
  const [tokenId, setTokenId] = useState('')

  const { writeContract, isPending, data: hash, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const handleCertify = () => {
    if (!tokenId || isNaN(parseInt(tokenId))) {
      toast('Erreur',{
        description: 'Veuillez entrer un ID valide',
      })
      return
    }

    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'certifyItem',
      args: [BigInt(tokenId)],
    })
  }

  if (error) {
    toast('Erreur',{
      description: error.message
    })
  }

  if (isConfirmed) {
    toast('Item certifié',{
      description: `L'item #${tokenId} a été certifié avec succès`,
    })
    setTokenId('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifier un Item</CardTitle>
        <CardDescription>
          Certifiez un bien en entrant son ID (réservé aux certifiers)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="ID de l'item"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            type="number"
          />
          <Button 
            onClick={handleCertify}
            disabled={isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Certification...
              </>
            ) : (
              'Certifier'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}