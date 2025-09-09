import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { contractAddress } from '../lib/wagmi'
import ABI from '@/lib/contract_abi'



export default function VerifyItem() {
  const [serialNumber, setSerialNumber] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const { refetch, isFetching } = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: 'verifyItemBySerialNumber',
    args: [serialNumber]
  })

  const handleVerify = async () => {
    if (!serialNumber.trim()) return
    
    const { data } = await refetch()
    setVerificationResult(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérifier l'Authenticité d'un Item</CardTitle>
        <CardDescription>
          Entrez le numéro de série pour vérifier l'authenticité d'un bien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Numéro de série"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
          />
          <Button onClick={handleVerify} disabled={isFetching}>
            {isFetching ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>

        {verificationResult && (
          <div className="p-4 border rounded-lg">
            {verificationResult[0] ? (
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Item trouvé</h4>
                <p>Token ID: {verificationResult[1].toString()}</p>
                <p>Propriétaire: {verificationResult[2]}</p>
                <Badge
                  variant={verificationResult[3] ? 'default' : 'secondary'}
                  className={verificationResult[3] ? 'bg-green-100 text-green-800' : ''}
                >
                  {verificationResult[3] ? 'Certifié' : 'Non certifié'}
                </Badge>
              </div>
            ) : (
              <div className="text-destructive">
                ❌ Aucun item trouvé avec ce numéro de série
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}