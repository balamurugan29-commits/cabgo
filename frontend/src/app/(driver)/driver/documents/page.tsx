'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { driverApi } from '@/services/api';
import { DocumentType, DocumentStatus, DriverDocument } from '@/types';
import { toast } from 'sonner';

export default function DriverDocumentsPage() {
  const [documents, setDocuments] = useState<DriverDocument[]>([
    {
      id: 'doc-1',
      driver_id: 'driver-profile-001',
      type: DocumentType.DRIVING_LICENSE,
      document_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
      status: DocumentStatus.APPROVED,
      rejection_reason: null,
      reviewed_at: '2026-02-01T00:00:00.000Z',
      reviewed_by: 'admin-001',
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'doc-2',
      driver_id: 'driver-profile-001',
      type: DocumentType.VEHICLE_REGISTRATION,
      document_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
      status: DocumentStatus.APPROVED,
      rejection_reason: null,
      reviewed_at: '2026-02-01T00:00:00.000Z',
      reviewed_by: 'admin-001',
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
    },
  ]);

  const [uploadType, setUploadType] = useState<DocumentType>(DocumentType.INSURANCE);
  const [docUrl, setDocUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    driverApi
      .getProfile()
      .then((res) => {
        if (res.data?.documents?.length) {
          setDocuments(res.data.documents);
        }
      })
      .catch(() => {});
  }, []);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) {
      toast.error('Document URL is required');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await driverApi.addDocument({
        type: uploadType,
        document_url: docUrl,
      });
      setDocuments([...documents, res.data]);
      toast.success('Document uploaded for Admin verification');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.APPROVED:
        return (
          <Badge variant="success" className="text-[10px]">
            <CheckCircle2 className="size-3 mr-1" /> Approved
          </Badge>
        );
      case DocumentStatus.PENDING:
        return (
          <Badge variant="warning" className="text-[10px]">
            <Clock className="size-3 mr-1" /> Pending Review
          </Badge>
        );
      case DocumentStatus.REJECTED:
        return (
          <Badge variant="destructive" className="text-[10px]">
            <AlertTriangle className="size-3 mr-1" /> Rejected
          </Badge>
        );
    }
  };

  const docTypesList = [
    { type: DocumentType.DRIVING_LICENSE, label: 'Driving License', desc: 'Valid commercial driver license' },
    { type: DocumentType.VEHICLE_REGISTRATION, label: 'Vehicle RC', desc: 'Registration Certificate issued by RTO' },
    { type: DocumentType.INSURANCE, label: 'Insurance Policy', desc: 'Active comprehensive motor insurance' },
    { type: DocumentType.IDENTITY_PROOF, label: 'Identity Proof (Aadhaar/Passport)', desc: 'Government photo identification' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Driver Verification Documents"
        description="Submit your mandatory identity and commercial driving certificates for platform onboarding"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Upload Form */}
        <div className="md:col-span-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upload Document</CardTitle>
              <CardDescription>Select document type and provide image/scan URL</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadDocument} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as DocumentType)}
                    className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 outline-none"
                  >
                    <option value={DocumentType.DRIVING_LICENSE}>Driving License</option>
                    <option value={DocumentType.VEHICLE_REGISTRATION}>Vehicle Registration (RC)</option>
                    <option value={DocumentType.INSURANCE}>Insurance Policy</option>
                    <option value={DocumentType.IDENTITY_PROOF}>Identity Proof (Aadhaar/PAN)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Document Image URL / Supabase Storage</label>
                  <Input
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
                  <Upload className="size-3.5 mr-1" /> Submit Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Documents List */}
        <div className="md:col-span-7 space-y-3">
          {docTypesList.map((dt) => {
            const uploaded = documents.find((d) => d.type === dt.type);

            return (
              <Card key={dt.type} className="shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted flex items-center justify-center text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{dt.label}</p>
                      <p className="text-xs text-muted-foreground">{dt.desc}</p>
                      {uploaded?.rejection_reason && (
                        <p className="text-xs text-rose-600 mt-1">Reason: {uploaded.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    {uploaded ? (
                      getStatusBadge(uploaded.status)
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Not Uploaded
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
