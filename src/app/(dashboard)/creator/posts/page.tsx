"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Calendar,
  Upload,
  MoreHorizontal,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  BarChart3,
  Users,
  MessageCircle,
  Heart,
  Share,
  Eye,
  Image as ImageIcon,
  Video,
  FileText,
  Hash,
  AtSign,
  Clock,
  Send,
  Save,
  Trash2,
  Edit3,
  Plus,
  X,
  Menu,
  Sparkles,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";
import CreatorLayout from "@/Components/Creater/CreatorLayout";
import { apiRequest } from "@/lib/apiClient";
import { getUserId } from "@/lib/userUtils";
import { getFriendlyMessage } from "@/lib/errors";
import { cookieAuthUtils } from "@/lib/cookieAuth";
import { usePostFormPersistence } from "@/hooks/usePostFormPersistence";
import { twitterService } from "@/lib/twitter";
import { facebookService } from "@/lib/facebook";
import { instagramService } from "@/lib/instagram";
import { linkedInService } from "@/lib/linkedin";
import { youtubeService } from "@/lib/youtube";
import { useRouter } from "next/navigation";

import { useRef } from "react";
import { AIScoreIndicator } from "@/Components/ui/AIScoreIndicator";
// Platform configurations
const PLATFORM_CONFIGS = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "pink",
    postTypes: ["post", "story", "reel"],
    maxCaptionLength: 2200,
    supportedMedia: ["image", "video"],
    fields: {
      caption: { required: false, placeholder: "Write a caption..." },
      hashtags: { required: false, placeholder: "#fashion #style #ootd" },
      mentions: { required: false, placeholder: "@username" },
      location: { required: false, placeholder: "Add location" },
      altText: {
        required: false,
        placeholder: "Describe this image for accessibility",
      },
    },
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "red",
    postTypes: ["video", "short"],
    maxCaptionLength: 5000,
    supportedMedia: ["video"],
    fields: {
      title: {
        required: true,
        placeholder: "Enter video title (max 100 characters)",
        maxLength: 100,
      },
      description: {
        required: false,
        placeholder: "Tell viewers about your video",
        maxLength: 5000,
      },
      tags: { required: false, placeholder: "gaming, tutorial, review" },
      privacy: {
        required: false,
        options: ["public", "unlisted", "private"],
        default: "public",
      },
      thumbnail: {
        required: false,
        type: "file",
        placeholder: "Upload custom thumbnail (optional)",
        accept: "image/*"
      },
    },
  },
  twitter: {
    name: "Twitter",
    icon: Twitter,
    color: "sky",
    postTypes: ["tweet", "thread"],
    maxCaptionLength: 280,
    supportedMedia: ["image", "video", "gif"],
    fields: {
      // Basic content field for all tweet types
      content: {
        required: true,
        placeholder: "What's happening?",
        maxLength: 280,
        label: "Tweet Content",
      },
      // Additional fields will be handled in the TwitterPostForm component
    },
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "blue",
    postTypes: ["post", "article"],
    maxCaptionLength: 3000,
    supportedMedia: ["image", "video", "document"],
    fields: {
      content: {
        required: true,
        placeholder: "Share your professional thoughts...",
      },
      hashtags: {
        required: false,
        placeholder: "#professional #networking #career",
      },
      mentions: { required: false, placeholder: "@connection" },
      visibility: {
        required: false,
        options: ["public", "connections"],
        default: "public",
      },
      articleTitle: {
        required: false,
        placeholder: "Article title (for article posts)",
      },
      articleBody: {
        required: false,
        placeholder: "Article content",
        type: "textarea",
      },
    },
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "blue",
    postTypes: ["post"],
    maxCaptionLength: 63206,
    supportedMedia: ["image", "video"],
    fields: {
      content: { required: false, placeholder: "What's on your mind?" },
      hashtags: { required: false, placeholder: "#facebook #social" },
      linkPreview: { required: false, type: "url", placeholder: "Add a link" },
    },
  },
};

interface Post {
  _id?: string;
  platform: string;
  post_type: string;
  status: string;
  content: {
    caption?: string;
    hashtags?: string[];
    mentions?: string[];
  };
  [key: string]: any;
}

// Twitter-specific form component
const TwitterPostForm = ({
  postData,
  onFieldChange,
  selectedPostType,
  focusedField,
  setFocusedField,
}: {
  postData: any;
  onFieldChange: (field: string, value: any) => void;
  selectedPostType: string;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
}) => {
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [threadTweets, setThreadTweets] = useState([""]);

  // Handle poll option changes
  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
    onFieldChange(
      "poll_options",
      newOptions.filter((opt) => opt.trim())
    );
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
      onFieldChange(
        "poll_options",
        newOptions.filter((opt) => opt.trim())
      );
    }
  };

  // Handle thread tweet changes
  const handleThreadTweetChange = (index: number, value: string) => {
    const newThread = [...threadTweets];
    newThread[index] = value;
    setThreadTweets(newThread);
    onFieldChange(
      "thread",
      newThread.filter((tweet) => tweet.trim())
    );
  };

  // Add thread tweet
  const addThreadTweet = () => {
    if (threadTweets.length < 25) {
      setThreadTweets([...threadTweets, ""]);
    }
  };

  // Remove thread tweet
  const removeThreadTweet = (index: number) => {
    if (threadTweets.length > 1) {
      const newThread = threadTweets.filter((_, i) => i !== index);
      setThreadTweets(newThread);
      onFieldChange(
        "thread",
        newThread.filter((tweet) => tweet.trim())
      );
    }
  };

  
  return (
    <div className="space-y-6">
      {/* Basic Tweet Content - Always shown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Tweet Content *
          </label>
          <AIScoreIndicator
            content={postData.content || ""}
            field="content"
            platform="twitter"
            contentType="tweet"
            enabled={true}
            showDetails={true}
            isFieldFocused={focusedField === "twitter-content"}
            onFocusChange={(focused) => {
              if (focused) {
                setFocusedField("twitter-content");
              } else if (focusedField === "twitter-content") {
                setFocusedField(null);
              }
            }}
          />
        </div>
        <textarea
          value={postData.content || ""}
          onChange={(e) => onFieldChange("content", e.target.value)}
          onFocus={() => setFocusedField("twitter-content")}
          onBlur={() => {
            setTimeout(() => {
              if (focusedField === "twitter-content") {
                setFocusedField(null);
              }
            }, 200);
          }}
          placeholder="What's happening?"
          maxLength={280}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">
          {postData.content?.length || 0}/280 characters
        </div>
      </div>

      {/* Thread Section - Only for thread type */}
      {selectedPostType === "thread" && (
        <div className="border-l-4 border-blue-500 pl-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Thread Tweets
          </h4>
          <div className="space-y-3">
            {threadTweets.map((tweet, index) => (
              <div key={index} className="flex space-x-2">
                <div className="flex-shrink-0 pt-3 text-sm text-gray-500">
                  {index + 1}.
                </div>
                <textarea
                  value={tweet}
                  onChange={(e) =>
                    handleThreadTweetChange(index, e.target.value)
                  }
                  placeholder={`Tweet ${index + 1} of your thread`}
                  maxLength={280}
                  rows={2}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {threadTweets.length > 1 && (
                  <button
                    onClick={() => removeThreadTweet(index)}
                    className="flex-shrink-0 p-3 text-red-500 hover:text-red-700"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {threadTweets.length < 25 && (
              <button
                onClick={addThreadTweet}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                type="button"
              >
                <Plus size={14} />
                <span>Add Tweet to Thread</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reply Settings - For all types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reply Settings
        </label>
        <select
          value={postData.reply_settings || "everyone"}
          onChange={(e) => onFieldChange("reply_settings", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="everyone">Everyone can reply</option>
          <option value="following">People you follow</option>
          <option value="mentioned">Only people you mention</option>
        </select>
      </div>
    </div>
  );
};

export default function PostsPage() {
  // Use persistence hook for form data
  const {
    selectedPlatform,
    setSelectedPlatform,
    selectedPostType,
    setSelectedPostType,
    postData,
    setPostData,
    mediaFiles,
    setMediaFiles,
    threadTweets,
    setThreadTweets,
    clearFormData,
  } = usePostFormPersistence();

  // Regular state for non-form data
  const [activeTab, setActiveTab] = useState<
    "create" | "drafts" | "scheduled" | "published"
    >("create");
  
  // Track which field is currently focused for AI score popup visibility
  const [focusedField, setFocusedField] = useState<string | null>(null);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "published") setActiveTab("published");
  else if (status === "draft") setActiveTab("drafts");
  else if (status === "scheduled") setActiveTab("scheduled");
  else setActiveTab("create");
  }, []);
  
 const router = useRouter();

  // const handleClick = () => {
  //   try {
  //     sessionStorage.setItem("invalidate_connections_cache", "1");
  //   } catch {}
  //   router.push("/creator/settings#linked_account");
  // };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [openMenuScheduledId, setOpenMenuScheduledId] = useState<string | null>(
    null
  );
  const [openMenuPublishedId, setOpenMenuPublishedId] = useState<string | null>(
    null
  );
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, any>>({});
  const [refreshingAnalytics, setRefreshingAnalytics] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [youtubeConnected, setYoutubeConnected] = useState<boolean>(false);
  const [checkingConnection, setCheckingConnection] = useState<boolean>(false);

  // Platform connection status - simple array approach
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [checkingConnections, setCheckingConnections] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [showPublishingDialog, setShowPublishingDialog] = useState<boolean>(false);
  const [showShortsDialog, setShowShortsDialog] = useState<boolean>(false);
  const [shortsDialogText, setShortsDialogText] = useState<string>("");
  const [showPublishResultDialog, setShowPublishResultDialog] = useState<boolean>(false);
  const [publishResultText, setPublishResultText] = useState<string>("");

  // Facebook Pages selection
  const [facebookPages, setFacebookPages] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedFacebookPageId, setSelectedFacebookPageId] = useState<string>("")
  const [loadingFbPages, setLoadingFbPages] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);

const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setOpenMenuPublishedId(null); // 👈 Close menu
    }
  }

  if (openMenuPublishedId) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [openMenuPublishedId]);

  


const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // thoda delay de dete hain taaki DOM load ho jaye
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      }
    }
  }, [pathname, searchParams]);



  
  const fetchFacebookPages = async () => {
    try {
      setLoadingFbPages(true);
      const resp = await facebookService.getPages();
      if (resp?.success && Array.isArray(resp.pages)) {
        setFacebookPages(resp.pages.map((p: any) => ({ id: p.id, name: p.name })));
        if (resp.pages.length === 1) {
          setSelectedFacebookPageId(resp.pages[0].id);
        }
      } else {
        setFacebookPages([]);
      }
    } catch (e) {
      setFacebookPages([]);
    } finally {
      setLoadingFbPages(false);
    }
  };

  useEffect(() => {
    if (selectedPlatform === "facebook") {
      // load available pages for posting
      fetchFacebookPages();
    }
  }, [selectedPlatform]);

  // Connection cache helpers (5 min TTL)
  const CONNECTIONS_CACHE_KEY = 'platform_connections_v1';
  const CONNECTIONS_CACHE_TTL = 5 * 60 * 1000;

  const loadConnectionsCache = (): { platforms: string[]; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(CONNECTIONS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.platforms) || typeof parsed.timestamp !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const saveConnectionsCache = (platforms: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        CONNECTIONS_CACHE_KEY,
        JSON.stringify({ platforms, timestamp: Date.now() })
      );
    } catch {}
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      const response = (await apiRequest("/api/profile/me")) as any;
      if (response?.user) {
        cookieAuthUtils.updateUserData(response.user);
        return response.user;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
    return null;
  };

  // Check platform connections - API-based approach (like settings page)
  const checkPlatformConnections = async (force = false) => {
    const now = Date.now();

    // Use cache when fresh, unless force refresh requested
    if (!force) {
      const cached = loadConnectionsCache();
      if (cached && now - cached.timestamp < CONNECTIONS_CACHE_TTL) {
        setConnectedPlatforms(cached.platforms);
        setCheckingConnections(false);
        return;
      }
    }

    // Throttle rapid calls regardless of force
    if (!force && now - lastCheckTime < 2000) {
      return;
    }

    try {
      setCheckingConnections(true);
      setLastCheckTime(now);

      const connected: string[] = [];

      // Check each platform individually using their services with proper error handling
      // Use Promise.allSettled to prevent one failure from breaking all checks
      const results = await Promise.allSettled([
        twitterService.isConnectedLight().catch(() => false),
        facebookService.isConnectedLight().catch(() => false),
        instagramService.isConnectedLight().catch(() => false),
        youtubeService.isConnectedLight().catch(() => false),
        linkedInService.isConnectedLight().catch(() => false),
      ]);

      // Extract results with fallback to false on rejection
      const [twitterConn, facebookConn, instagramConn, ytConn, liConn] = results.map(
        (result) => (result.status === 'fulfilled' ? result.value : false)
      );

      // Update YouTube connection state for validation and button disabling
      setYoutubeConnected(!!ytConn);

      // Build connected platforms array
      if (twitterConn) connected.push("twitter");
      if (facebookConn) connected.push("facebook");
      if (instagramConn) connected.push("instagram");
      if (liConn) connected.push("linkedin");
      if (ytConn) connected.push("youtube");

      setConnectedPlatforms(connected);
      saveConnectionsCache(connected);
    } catch (error) {
      console.error("Error checking platform connections:", error);
      // Don't clear existing connections on error, just keep current state
      // Only clear if this was a force refresh
      if (force) {
        setConnectedPlatforms([]);
      }
    } finally {
      setCheckingConnections(false);
    }
  };

  // Handle platform selection
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    try {
      const firstType = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]?.postTypes?.[0] || "";
      setSelectedPostType(firstType);
    } catch {
    setSelectedPostType("");
    }
    setPostData({});
    setMediaFiles([]);
    setError("");
    setSuccess("");
setShowModal(true)
    // Check YouTube connection when YouTube is selected
    if (platform === "youtube") {
      checkYouTubeConnection();
    }
  };

  // Load a draft into the form for editing/publishing
  const loadDraftIntoForm = async (post: Post) => {
    try {
      // Optionally fetch latest version
      const latest = await apiRequest<any>(`/api/posts/${post._id}`);
      const p = latest?.post || latest?.data?.post || post;

      setActiveTab("create");
      setSelectedPlatform(p.platform);
      setSelectedPostType(p.post_type);

      const baseCaption = p?.content?.caption || "";
      const baseHashtags = Array.isArray(p?.content?.hashtags)
        ? p.content.hashtags.join(",")
        : "";
      const baseMentions = Array.isArray(p?.content?.mentions)
        ? p.content.mentions.join(",")
        : "";

      const nextData: any = {
        caption: baseCaption,
        content: baseCaption,
        hashtags: baseHashtags,
        mentions: baseMentions,
      };

      // YouTube specifics
      const yt = (p as any).platformContent?.youtube;
      if (p.platform === "youtube" && yt) {
        nextData.title = yt.title || p.title || "";
        nextData.description = yt.description || "";
        nextData.tags = Array.isArray(yt.tags) ? yt.tags.join(",") : "";
        nextData.privacy = yt.privacy_status || "public";
      }

      // Twitter basics (poll/thread not reconstructed here)
      if (p.platform === "twitter") {
        nextData.content = baseCaption;
      }

      setPostData(nextData);
      setMediaFiles([]); // Media cannot be reconstructed client-side; prompt user to re-add if needed
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  };

  // Delete a draft
  const deleteDraft = async (postId?: string) => {
    if (!postId) return;
    try {
      await apiRequest(`/api/posts/${postId}`, { method: "DELETE" });
      // Refresh drafts list
      // Clear cache after delete
      const { cacheUtils } = await import("@/lib/apiClient");
      cacheUtils.clearPattern('/api/posts');
      // Notify other components
      window.dispatchEvent(new CustomEvent('postDeleted'));
      loadPosts(false, true); // Force refresh after delete
    } catch (e) {
      console.error("Failed to delete draft:", e);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    loadPosts();

    // Try cache first for instant UI; background refresh only if needed
    const cached = loadConnectionsCache();
    if (cached && Date.now() - cached.timestamp < CONNECTIONS_CACHE_TTL) {
      setConnectedPlatforms(cached.platforms);
      setCheckingConnections(false);
    } else {
      checkPlatformConnections(false);
    }

    // If navigation initiated from this page to settings, force refresh once on return
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('invalidate_connections_cache') === '1') {
        sessionStorage.removeItem('invalidate_connections_cache');
        checkPlatformConnections(true);
      }
    }
  }, []);

  // Load analytics when switching to published tab (with debounce)
  useEffect(() => {
    if (activeTab === "published" && !loadingPosts) {
      const timer = setTimeout(() => {
        loadPosts(false, false); // Load posts and analytics without syncing
      }, 300); // Small delay to prevent rapid tab switching from triggering multiple calls
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Refresh connections when window regains focus (user returns from settings) - with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleFocus = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Only refresh if cache is stale or invalidated
        const cached = loadConnectionsCache();
        const stale = !cached || (Date.now() - cached.timestamp >= CONNECTIONS_CACHE_TTL);
        const shouldForce = sessionStorage.getItem('invalidate_connections_cache') === '1';
        if (shouldForce) {
          sessionStorage.removeItem('invalidate_connections_cache');
        }
        if (stale || shouldForce) {
          checkPlatformConnections(!!shouldForce);
        }
      }, 500);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(timeoutId);
    };
  }, []);

  // Visibility-aware background refresh (every 5 minutes while visible)
  useEffect(() => {
    let timerId: number | null = null;
    let inFlight = false;

    const run = () => {
      if (inFlight || document.hidden) { schedule(); return; }
      inFlight = true;
      checkPlatformConnections(true).finally(() => {
        inFlight = false;
        schedule();
      });
    };

    const schedule = () => {
      if (timerId) clearTimeout(timerId);
      const delay = document.hidden ? 60 * 60 * 1000 : 5 * 60 * 1000;
      timerId = window.setTimeout(run, delay);
    };

    const onVisibility = () => {
      if (!document.hidden) {
        if (timerId) clearTimeout(timerId);
        timerId = window.setTimeout(run, 250);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    schedule();
    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const checkYouTubeConnection = async () => {
    try {
      setCheckingConnection(true);
      const connected = await youtubeService.isConnectedLight();
      setYoutubeConnected(connected);
    } catch (err) {
      setYoutubeConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadPosts = async (syncAnalytics = false, force = false) => {
    // Also fetch engagement metrics from new API
    try {
      const { fetchPublishedPosts } = await import('@/lib/engagementApi');
      const engagementRes = await fetchPublishedPosts({
        page: 1,
        limit: 100,
        includeMetrics: true
      });
      
      if (engagementRes.success && engagementRes.data?.posts) {
        // Create a map of engagement metrics by platform_post_id
        const engagementMap: Record<string, any> = {};
        engagementRes.data.posts.forEach(post => {
          if (post.platform_post_id) {
            engagementMap[post.platform_post_id] = post.metrics;
          }
        });
        
        // Merge engagement metrics into analytics map
        setAnalyticsMap(prev => ({ ...prev, ...engagementMap }));
      }
    } catch (err) {
      console.warn('Failed to fetch engagement metrics:', err);
    }
    // Prevent duplicate calls within 2 seconds unless forced
    const now = Date.now();
    // Basic throttling for non-forced requests (apiClient handles deduplication)
    if (!force && now - lastLoadTime < 2000) {
      return; // Too soon since last load
    }

    try {
      setLoadingPosts(true);
      setLastLoadTime(now);
      
      const [publishedRes, scheduledRes, draftsRes, failedRes] =
        await Promise.all([
          apiRequest<{ posts: Post[]; pagination: any }>(
            "/api/posts?status=published"
          ),
          apiRequest<{ scheduled: Post[]; pagination: any }>(
            "/api/posts/scheduled"
          ),
          apiRequest<{ posts: Post[]; pagination: any }>(
            "/api/posts?status=draft"
          ),
          apiRequest<{ posts: Post[]; pagination: any }>(
            "/api/posts?status=failed"
          ),
        ]);
      setPosts(publishedRes.posts || []);
      setScheduledPosts((scheduledRes as any).scheduled || []);
      const draftsList = (draftsRes.posts || []).concat(failedRes.posts || []);
      setDrafts(draftsList);

      // Fetch analytics for published posts
      const userId = getUserId();

      if (userId) {
        // Sync analytics from platforms first if requested
        if (syncAnalytics) {
          try {
            await apiRequest<{ success: boolean }>(`/api/analytics/user/${userId}/sync`, {
              method: 'POST'
            });
          } catch (err) {
            console.warn("Failed to sync analytics:", err);
          }
        }

        // Fetch analytics with retry logic
        const fetchAnalyticsWithRetry = async (maxRetries = 2): Promise<any[]> => {
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              if (attempt > 0) {
                // Exponential backoff: 1s, 2s
                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
              }
              const analyticsRes = await apiRequest<{
                success: boolean;
                data: { analytics: any[] };
              }>(`/api/analytics/user/${userId}`);
              return analyticsRes?.data?.analytics || [];
            } catch (error) {
              if (attempt === maxRetries) {
                console.error("Failed to fetch analytics after retries:", error);
                return [];
              }
            }
          }
          return [];
        };

        try {
          const analytics = await fetchAnalyticsWithRetry();
          
          // Create a map of analytics by post_id (support multiple key formats)
          const map: Record<string, any> = {};
          analytics.forEach((item) => {
            if (item.post_id) {
              const postId = String(item.post_id); // Normalize to string
              map[postId] = item;
              // Also store by original format if different
              if (typeof item.post_id !== 'string') {
                const originalId = String(item.post_id);
                if (originalId !== postId) {
                  map[originalId] = item;
                }
              }
            }
          });
          setAnalyticsMap(map);
        } catch (error) {
          console.error("Failed to process analytics:", error);
        }
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleRefreshAnalytics = async () => {
    setRefreshingAnalytics(true);
    await loadPosts(true, true); // Sync analytics and force refresh
    setRefreshingAnalytics(false);
  };

  const getPostAnalytics = (post: Post) => {
    // First check if post has embedded analytics
    if (post.analytics && (post.analytics.likes || post.analytics.views || post.analytics.comments || post.analytics.shares)) {
      return {
        likes: post.analytics.likes || 0,
        comments: post.analytics.comments || 0,
        shares: post.analytics.shares || 0,
        views: post.analytics.views || 0,
      };
    }

    // Try to match with analytics from API by platform_post_id first
    const platformPostId = post.publishing?.platform_post_id;
    if (platformPostId) {
      // Try exact match and stringified match
      const analytics = analyticsMap[platformPostId] || analyticsMap[String(platformPostId)];
      if (analytics) {
        return {
          likes: analytics.metrics?.likes || 0,
          comments: analytics.metrics?.comments || 0,
          shares: analytics.metrics?.shares || 0,
          views: analytics.metrics?.views || 0,
        };
      }
    }

    // Fallback: try matching by post _id (some analytics use post._id as post_id)
    if (post._id) {
      // Try exact match and stringified match
      const analytics = analyticsMap[post._id] || analyticsMap[String(post._id)];
      if (analytics) {
        return {
          likes: analytics.metrics?.likes || 0,
          comments: analytics.metrics?.comments || 0,
          shares: analytics.metrics?.shares || 0,
          views: analytics.metrics?.views || 0,
        };
      }
    }

    return { likes: 0, comments: 0, shares: 0, views: 0 };
  };

  const handleViewPost = (post: Post) => {
    if (post.publishing?.platform_url) {
      window.open(post.publishing.platform_url, '_blank', 'noopener,noreferrer');
    } else {
      // If no platform URL, could navigate to post details or show a message
      setSuccess("No platform URL available for this post");
    }
    setOpenMenuPublishedId(null);
  };

  const handleCopyLink = async (post: Post) => {
    const url = post.publishing?.platform_url;
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setSuccess("Link copied to clipboard!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to copy link");
        setTimeout(() => setError(""), 3000);
      }
    } else {
      setError("No link available for this post");
      setTimeout(() => setError(""), 3000);
    }
    setOpenMenuPublishedId(null);
  };

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Are you sure you want to delete this post? This action cannot be undone.`)) {
      setOpenMenuPublishedId(null);
      return;
    }

    try {
      await apiRequest(`/api/posts/${post._id}`, {
        method: 'DELETE'
      });
      // Clear cache after delete
      const { cacheUtils } = await import("@/lib/apiClient");
      cacheUtils.clearPattern('/api/posts');
      // Notify other components
      window.dispatchEvent(new CustomEvent('postDeleted'));
      setSuccess("Post deleted successfully");
      await loadPosts(false, true); // Reload posts with force refresh
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
      setTimeout(() => setError(""), 3000);
    }
    setOpenMenuPublishedId(null);
  };

  const handlePostTypeSelect = (postType: string) => {
    setSelectedPostType(postType);
    setPostData({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setPostData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMediaUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      const config =
        PLATFORM_CONFIGS[selectedPlatform as keyof typeof PLATFORM_CONFIGS];

      // Validate file types
      const validFiles = fileArray.filter((file) => {
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "other";
        return config.supportedMedia.includes(fileType);
      });

      setMediaFiles(validFiles);

      // For YouTube videos, analyze if it might be a Short
      if (selectedPlatform === "youtube" && validFiles.length > 0) {
        const videoFile = validFiles[0];
        analyzeVideoForShorts(videoFile);
      }
    }
  };

  // Analyze video file to predict if it will be detected as a YouTube Short
  const analyzeVideoForShorts = (file: File) => {
    if (!file.type.startsWith("video/")) return;

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = video.duration;

      const isVertical = height > width;
      const isShortDuration = duration <= 60;
      const isShortResolution = height >= 1080 && width <= 1920;

      const likelyShorts = isVertical && (isShortDuration || isShortResolution);

      console.log("🎬 Video analysis preview:", {
        width,
        height,
        duration: duration.toFixed(1) + "s",
        aspectRatio: (height / width).toFixed(2),
        isVertical,
        isShortDuration,
        isShortResolution,
        likelyShorts
      });

      // Show a dialog if video is likely to be detected as Shorts
      if (likelyShorts && selectedPostType !== "short") {
        setShortsDialogText(
          `This video appears to be a YouTube Short (${width}x${height}, ${duration.toFixed(1)}s). Consider selecting "Short" as the post type for better optimization.`
        );
        setShowShortsDialog(true);
      }
    };

    video.src = URL.createObjectURL(file);
  };

  const validatePost = () => {
    if (!selectedPlatform || !selectedPostType) {
      throw new Error("Please select platform and post type");
    }

    const config =
      PLATFORM_CONFIGS[selectedPlatform as keyof typeof PLATFORM_CONFIGS];

    // Check required fields
    Object.entries(config.fields).forEach(([field, fieldConfig]) => {
      // Special case: LinkedIn article should not require 'content'
      if (selectedPlatform === "linkedin" && selectedPostType === "article" && field === "content") {
        return; // skip content requirement for articles
      }
      if (
        fieldConfig.required &&
        (!postData[field] || postData[field].toString().trim().length === 0)
      ) {
        throw new Error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required for ${config.name}`
        );
      }
    });

    // Check caption/content length
    const contentField = postData.caption || postData.content || "";
    if (contentField && contentField.length > config.maxCaptionLength) {
      throw new Error(
        `Content exceeds maximum length of ${config.maxCaptionLength} characters`
      );
    }

    // Platform-specific validations
    if (selectedPlatform === "youtube") {
      if (!youtubeConnected) {
        throw new Error(
          "Please connect your YouTube account in Settings before posting"
        );
      }
      if (mediaFiles.length === 0) {
        throw new Error("Video file is required for YouTube posts");
      }
      if (!postData.title || postData.title.trim().length === 0) {
        throw new Error("Title is required for YouTube posts");
      }
    }

    if (selectedPlatform === "twitter") {
      if (!postData.content || postData.content.trim().length === 0) {
        throw new Error("Content is required for Twitter posts");
      }

      // Validate thread data
      if (
        selectedPostType === "thread" &&
        postData.thread &&
        Array.isArray(postData.thread)
      ) {
        const validThreadTweets = postData.thread.filter(
          (tweet: string) => tweet && tweet.trim().length > 0
        );
        if (validThreadTweets.length === 0) {
          throw new Error("Thread must contain at least one valid tweet");
        }
      }
    }

    if (selectedPlatform === "linkedin") {
      if (selectedPostType === "article") {
        if (!(postData as any).articleTitle || (postData as any).articleTitle.trim().length === 0) {
          throw new Error("Article Title is required for LinkedIn");
        }
        if (!(postData as any).articleBody || (postData as any).articleBody.trim().length === 0) {
          throw new Error("Article Body is required for LinkedIn");
        }
      } else {
      if (!postData.content || postData.content.trim().length === 0) {
        throw new Error("Content is required for LinkedIn posts");
        }
      }
    }

    // Validate media files
    if (mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "other";
        if (!config.supportedMedia.includes(fileType)) {
          throw new Error(
            `File ${index + 1} (${file.name}) is not supported for ${config.name
            }`
          );
        }
      });
    }
  };

  // Debug/Test helpers removed

  // Enhanced Twitter post payload creation
  const createTwitterPostPayload = (
    postData: any,
    selectedPostType: string,
    mediaFiles: File[]
  ) => {
    const basePayload: any = {
      platform: "twitter",
      post_type: selectedPostType,
      status: "draft",
      title: postData.content || postData.poll_question || "Twitter Post",
      content: {
        caption: postData.content || "",
        hashtags: postData.hashtags
          ? postData.hashtags
            .split(",")
            .map((h: string) => h.trim())
            .filter(Boolean)
          : [],
        mentions: postData.mentions
          ? postData.mentions
            .split(",")
            .map((m: string) => m.trim())
            .filter(Boolean)
          : [],
      },
    };

    // Twitter-specific content
    const twitterContent: any = {
      reply_settings: postData.reply_settings || "everyone",
    };

    // Handle different Twitter post types
    if (selectedPostType === "poll") {
      // For polls, use poll_question as the main content
      if (postData.poll_question) {
        basePayload.content.caption = postData.poll_question;
        basePayload.title = postData.poll_question;
      }

      twitterContent.poll = {
        question: postData.poll_question || postData.content || "Poll",
        options: (postData.poll_options || []).filter((opt: string) =>
          opt.trim()
        ),
        duration_minutes: postData.poll_duration || 1440,
      };
      twitterContent.tweet_type = "poll";
    } else if (selectedPostType === "thread" && postData.thread) {
      twitterContent.thread = postData.thread
        .filter((tweet: string) => tweet.trim())
        .map((text: string, index: number) => ({ text, position: index }));
      twitterContent.tweet_type = "thread";
    } else {
      // Regular tweet
      twitterContent.tweet_type = "tweet";
    }

    basePayload.platformContent = {
      twitter: twitterContent,
    };

    // Add media information
    if (mediaFiles.length > 0) {
      basePayload.media = mediaFiles.map((file: File) => ({
        filename: file.name,
        type: file.type.startsWith("image/") ? "image" : "video",
        size: file.size,
        mimeType: file.type,
      }));
    }

    console.log("🐦 Twitter Payload Debug:", {
      selectedPostType,
      postData,
      twitterContent,
      finalPayload: basePayload,
    });

    return basePayload;
  };

  const createPost = async (action: "draft" | "publish" | "schedule") => {
    try {
      setLoading(true);
      if (action === "publish") setShowPublishingDialog(true);
      setError("");
      setSuccess("");

      console.log("🚨 Creating post:", {
        action,
        selectedPlatform,
        selectedPostType,
        postData,
      });

      validatePost();

      // Check if we're in mock mode (for testing without backend)
      const mockMode = localStorage.getItem("mockMode") === "true";
      if (mockMode) {
        console.log("🎭 Mock mode: Simulating post creation");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSuccess(
          `Post ${action === "draft"
            ? "saved as draft"
            : action === "publish"
              ? "published"
              : "scheduled"
          } successfully! (Mock Mode)`
        );
        if (action === "publish") {
          setPublishResultText("Post published successfully! (Mock Mode)");
          setShowPublishResultDialog(true);
          setShowPublishingDialog(false);
        }
        setLoading(false);
        return;
      }

      let postPayload: any;

      // Build platform-specific payload
      if (selectedPlatform === "twitter") {
        postPayload = createTwitterPostPayload(
          postData,
          selectedPostType,
          mediaFiles
        );
      } else if (selectedPlatform === "instagram") {
        postPayload = {
          platform: selectedPlatform,
          post_type: selectedPostType,
          status: "draft", // Always create as draft first
          content: {
            caption: postData.caption || "",
            hashtags: postData.hashtags ? postData.hashtags.split(",").map((h: string) => h.trim()).filter(Boolean) : [],
            mentions: postData.mentions ? postData.mentions.split(",").map((m: string) => m.trim()).filter(Boolean) : [],
          },
          title: postData.caption || "Instagram Post", // Use caption for title consistency on backend
          media: mediaFiles.length > 0 ? mediaFiles.map(file => ({
            filename: file.name,
            type: file.type.startsWith("image/") ? "image" : "video",
            size: file.size,
            mimeType: file.type,
          })) : [],
          platformContent: {
            instagram: {
              location: postData.location || null,
              altText: postData.altText || null,
            }
          }
        };
      } else {
        // Generic payload for other platforms
        let actualContent = postData.caption || postData.content || postData.title || "";
        // Map LinkedIn article fields into content/title
        if (selectedPlatform === "linkedin" && selectedPostType === "article") {
          if ((postData as any).articleBody) actualContent = (postData as any).articleBody;
          if ((postData as any).articleTitle) postData.title = (postData as any).articleTitle;
        }

        postPayload = {
          platform: selectedPlatform,
          post_type: selectedPostType,
          status: "draft",
          content: {
            caption: actualContent.trim(),
            hashtags: postData.hashtags
              ? postData.hashtags
                .split(",")
                .map((h: string) => h.trim())
                .filter(Boolean)
              : [],
            mentions: postData.mentions
              ? postData.mentions
                .split(",")
                .map((m: string) => m.trim())
                .filter(Boolean)
              : [],
          },
          title: (postData.title || actualContent).trim(),
          media:
            mediaFiles.length > 0
              ? mediaFiles.map((file) => ({
                filename: file.name,
                // ✅ FIX: Convert the full MIME type to the simple type
                type: file.type.startsWith("image/")
                  ? "image"
                  : file.type.startsWith("video/")
                    ? "video"
                    : "document",
                size: file.size,
              }))
              : [],
        };

        // Add platform-specific content
        if (selectedPlatform === "youtube") {
          // For YouTube, let the backend analyze the video to determine if it's a Short
          // The frontend just passes the user's selection and lets backend do the analysis
          const isShort = selectedPostType === "short";

          // Normalize to backend's expected platformContent.youtube
          postPayload.platform_content = {
            youtube: {
              title: postData.title?.trim() || "",
              description: postData.description?.trim() || "",
              tags: postData.tags
                ? postData.tags
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
                : [],
              privacy_status: postData.privacy || "public",
              is_short: isShort,
            },
          };

          // Enforce YouTube media constraints early
          if (
            mediaFiles.length !== 1 ||
            !mediaFiles[0].type.startsWith("video/")
          ) {
            throw new Error("YouTube requires exactly one video file.");
          }
        } else if (selectedPlatform === "facebook") {
          // Provide selected page for posting
          if (selectedFacebookPageId) {
            postPayload.platform_content = {
              facebook: {
                pageId: selectedFacebookPageId,
              },
            };
          }
        }
        // Add other platform content as needed...
      }

      // Add scheduling if applicable
      if (action === "schedule" && postData.scheduledFor) {
        postPayload.scheduling = {
          scheduled_for: new Date(postData.scheduledFor).toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }

      console.log(
        "📤 Sending post payload:",
        JSON.stringify(postPayload, null, 2)
      );

      // Build request for create: use FormData so media files are uploaded
      let createResponse: any;
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        // Append scalar JSON fields
        formData.append("platform", postPayload.platform);
        formData.append("post_type", postPayload.post_type);
        formData.append("status", postPayload.status);
        formData.append("title", postPayload.title || "");
        formData.append("content", JSON.stringify(postPayload.content || {}));
        // Platform-specific content wrapper expected by backend as platformContent
        const platformContent = postPayload.platformContent
          ? postPayload.platformContent
          : postPayload.youtube_content
            ? { youtube: postPayload.youtube_content }
            : {};
        if (Object.keys(platformContent).length > 0) {
          formData.append("platformContent", JSON.stringify(platformContent));
        }
        if (postPayload.tags)
          formData.append("tags", JSON.stringify(postPayload.tags));
        if (postPayload.categories)
          formData.append("categories", JSON.stringify(postPayload.categories));

        // Append media files under field name 'media' expected by backend upload middleware
        mediaFiles.forEach((file) => formData.append("media", file));

        // Append thumbnail file if it exists (for YouTube, not Shorts)
        if (selectedPlatform === "youtube" && selectedPostType !== 'short' && postData.thumbnail) {
          formData.append("thumbnail", postData.thumbnail);
        }

        // Use API base and include auth header to avoid 404/HTML responses
        const { getApiBase } = await import("@/lib/config");
        const { cookieAuthUtils } = await import("@/lib/cookieAuth");
        const baseURL = getApiBase();
        // With HttpOnly cookies, tokens are handled server-side

        const res = await fetch(`${baseURL}/api/posts`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          // If server returned HTML, throw a readable error
          if (text && text.trim().startsWith("<!DOCTYPE")) {
            throw new Error(
              "Server returned an HTML error page (likely 404). Check API base URL and route."
            );
          }
          try {
            const errJson = JSON.parse(text);
            throw new Error(
              errJson?.message ||
              errJson?.error ||
              `Request failed with status ${res.status}`
            );
          } catch {
            throw new Error(text || `Request failed with status ${res.status}`);
          }
        }

        createResponse = await res.json();
      } else {
        // No files: JSON request is fine
        createResponse = await apiRequest("/api/posts", {
          method: "POST",
          body: JSON.stringify({
            ...postPayload,
            // Normalize to platformContent for backend
            ...(postPayload.youtube_content
              ? { platformContent: { youtube: postPayload.youtube_content } }
              : {}),
          }),
        });
      }

      const response = createResponse as any;
      console.log("✅ Post created successfully:", response);

      const postId =
        response.post?._id || response.data?.post?._id || response._id;

      if (!postId) {
        console.warn("⚠️ No post ID found in response:", response);
        setSuccess(
          `Post ${action === "draft"
            ? "saved as draft"
            : action === "publish"
              ? "published"
              : "scheduled"
          } successfully!`
        );
        return;
      }

      // Try to publish/schedule
      let publishSuccess = false;

      try {
        if (action === "publish") {
          await apiRequest(`/api/posts/${postId}/publish`, { method: "PUT" });
          console.log("✅ Post published successfully");
          publishSuccess = true;
        } else if (action === "schedule" && postData.scheduledFor) {
          await apiRequest(`/api/posts/${postId}/schedule`, {
            method: "PUT",
            body: JSON.stringify({
              scheduled_for: postData.scheduledFor,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
          });
          console.log("✅ Post scheduled successfully");
          publishSuccess = true;
        }
      } catch (publishError: any) {
        console.error("❌ Publish/Schedule failed:", publishError);
        publishSuccess = false;
        
        // Show prominent error notification
        const errorMsg = getFriendlyMessage(publishError);
        setError(`Post created successfully, but ${action} failed: ${errorMsg}. Post has been saved as draft.`);
        setTimeout(() => setError(""), 8000); // Show error for 8 seconds
      }

      // Set appropriate success message
      if (action === "publish") {
        if (publishSuccess) {
          setSuccess("Post created and published successfully!");
          setPublishResultText("Your post was published successfully.");
          setShowPublishResultDialog(true);
        } else {
          // Error already shown in catch block, but show info message too
          setSuccess("Post created successfully! (Publish failed - post saved as draft)");
        }
      } else if (action === "schedule") {
        if (publishSuccess) {
          setSuccess("Post created and scheduled successfully!");
        } else {
          // Error already shown in catch block, but show info message too
          setSuccess("Post created successfully! (Schedule failed - post saved as draft)");
        }
      } else {
        setSuccess("Post saved as draft successfully!");
      }

      // Reset form
      setSelectedPlatform("");
      setSelectedPostType("");
      setPostData({});
      setMediaFiles([]);

      // Clear cache before reloading to ensure fresh data
      const { cacheUtils } = await import("@/lib/apiClient");
      cacheUtils.clearPattern('/api/posts');
      cacheUtils.clearPattern('/api/analytics');
      
      // Notify other components to refresh
      window.dispatchEvent(new CustomEvent('postCreated'));
      if (action === 'schedule') {
        window.dispatchEvent(new CustomEvent('postScheduled'));
      }
      
      // Reload posts with force refresh
      loadPosts(false, true);
    } catch (err: unknown) {
      console.error("❌ Post creation failed:", err);

      let errorMessage = "Failed to create post";
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowPublishingDialog(false);
    }
  };

  const renderPlatformFields = () => {
    if (!selectedPlatform || !selectedPostType) return null;

    // Use TwitterPostForm for Twitter
    if (selectedPlatform === "twitter") {
      return (
        <TwitterPostForm
          postData={postData}
          onFieldChange={handleFieldChange}
          selectedPostType={selectedPostType}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
        />
      );
    }

    const config =
      PLATFORM_CONFIGS[selectedPlatform as keyof typeof PLATFORM_CONFIGS];

    // Special rendering for LinkedIn post types
    if (selectedPlatform === "linkedin") {
      if (selectedPostType === "article") {
    return (
      <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Article Title</label>
                <AIScoreIndicator
                  content={(postData as any).articleTitle || ""}
                  field="title"
                  platform="linkedin"
                  contentType="article"
                  enabled={true}
                  showDetails={true}
                  isFieldFocused={focusedField === "linkedin-articleTitle"}
                  onFocusChange={(focused) => {
                    if (focused) {
                      setFocusedField("linkedin-articleTitle");
                    } else if (focusedField === "linkedin-articleTitle") {
                      setFocusedField(null);
                    }
                  }}
                />
              </div>
              <input
                type="text"
                value={(postData as any).articleTitle || ""}
                onChange={(e) => handleFieldChange("articleTitle", e.target.value)}
                onFocus={() => setFocusedField("linkedin-articleTitle")}
                onBlur={() => {
                  setTimeout(() => {
                    if (focusedField === "linkedin-articleTitle") {
                      setFocusedField(null);
                    }
                  }, 200);
                }}
                placeholder="Enter article title"
                className="w-full p-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Article Body</label>
                <div className="flex items-center gap-2">
                  <AIScoreIndicator
                    content={(postData as any).articleBody || ""}
                    field="content"
                    platform="linkedin"
                    contentType="article"
                    enabled={true}
                    showDetails={true}
                    isFieldFocused={focusedField === "linkedin-articleBody"}
                    onFocusChange={(focused) => {
                      if (focused) {
                        setFocusedField("linkedin-articleBody");
                      } else if (focusedField === "linkedin-articleBody") {
                        setFocusedField(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const prompt = `Write a professional LinkedIn article body about: ${(postData as any).articleTitle || "my topic"}`;
                        const res = await apiRequest('/api/ai/suggestions', {
                          method: 'POST',
                          body: JSON.stringify({ prompt, platform: 'linkedin', type: 'article', context: postData })
                        }) as any;
                        const text = res?.data?.result?.content || '';
                        if (text) handleFieldChange('articleBody', text);
                      } catch {
                        setError('Failed to generate article content');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    title="Generate article with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI
                  </button>
                </div>
              </div>
              <textarea
                value={(postData as any).articleBody || ""}
                onChange={(e) => handleFieldChange("articleBody", e.target.value)}
                onFocus={() => setFocusedField("linkedin-articleBody")}
                onBlur={() => {
                  setTimeout(() => {
                    if (focusedField === "linkedin-articleBody") {
                      setFocusedField(null);
                    }
                  }, 200);
                }}
                placeholder="Write your article body..."
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        );
      }
      // For LinkedIn post (not article): keep default fields, but hide article-specific ones
    }

    return (
      <div className="space-y-6">
        {selectedPlatform === "facebook" && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Facebook Page
              </label>
              <button
                type="button"
                onClick={fetchFacebookPages}
                className="text-blue-600 text-sm hover:underline"
              >
                {loadingFbPages ? "Loading..." : "Refresh"}
              </button>
            </div>
            <select
              value={selectedFacebookPageId}
              onChange={(e) => setSelectedFacebookPageId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{loadingFbPages ? "Loading pages..." : "Select a Page (required to post)"}</option>
              {facebookPages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedFacebookPageId && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await facebookService.setDefaultPage(selectedFacebookPageId);
                      setSuccess("Default Facebook Page saved");
                    } catch (e) {
                      setError("Failed to set default page");
                    }
                  }}
                  className="text-xs text-gray-700 hover:text-gray-900 underline"
                >
                  Make default for future posts
                </button>
              </div>
            )}
          </div>
        )}
        {Object
          .entries(config.fields)
          .filter(([field]) => {
            // Hide LinkedIn article fields when not in article mode
            if (selectedPlatform === 'linkedin' && selectedPostType !== 'article') {
              if (field === 'articleTitle' || field === 'articleBody') return false;
            }
            // Hide YouTube thumbnail field for Shorts
            if (selectedPlatform === 'youtube' && selectedPostType === 'short') {
              if (field === 'thumbnail') return false;
            }
            return true;
          })
          .map(([field, fieldConfig]) => {
          // Handle file upload fields (like thumbnail)
          if ((fieldConfig as any).type === "file") {
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {fieldConfig.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept={(fieldConfig as any).accept || "*/*"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFieldChange(field, file);
                      }
                    }}
                    className="hidden"
                    id={`${field}-upload`}
                  />
                  <label
                    htmlFor={`${field}-upload`}
                    className="cursor-pointer block"
                  >
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-1">
                      {(fieldConfig as any).placeholder || `Upload ${field}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {postData[field] ? `Selected: ${(postData[field] as File)?.name}` : "Click to select file"}
                    </p>
                  </label>
                </div>
                {postData[field] && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {(postData[field] as File)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange(field, null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          }

          if ((fieldConfig as any).type === "textarea" || field === 'content') {
            // Check if this field should show AI score
            const shouldShowAIScore = ['description', 'caption', 'content'].includes(field);
            const fieldId = `${selectedPlatform}-${field}`;
            const isFieldFocused = focusedField === fieldId;
            
            return (
              <div key={field}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {fieldConfig.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                  <div className="flex items-center gap-2">
                    {shouldShowAIScore && selectedPlatform && (
                      <AIScoreIndicator
                        content={postData[field] || ""}
                        field={field}
                        platform={selectedPlatform}
                        contentType={selectedPostType || "post"}
                        enabled={true}
                        showDetails={true}
                        isFieldFocused={isFieldFocused}
                        onFocusChange={(focused) => {
                          if (focused) {
                            setFocusedField(fieldId);
                          } else if (focusedField === fieldId) {
                            setFocusedField(null);
                          }
                        }}
                      />
                    )}
                    {field === 'content' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const prompt = `Generate a social post for ${selectedPlatform}.` + (postData.hashtags ? ` Use hashtags: ${postData.hashtags}` : '');
                            const res = await apiRequest('/api/ai/suggestions', {
                              method: 'POST',
                              body: JSON.stringify({ prompt, platform: selectedPlatform, context: postData })
                            }) as any;
                            const text = res?.data?.result?.content || '';
                            if (text) {
                              handleFieldChange('content', text);
                            }
                          } catch (e) {
                            setError('Failed to generate content');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        title="Generate content with AI"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={postData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onFocus={() => setFocusedField(fieldId)}
                  onBlur={() => {
                    // Delay blur to allow clicking on the popup
                    setTimeout(() => {
                      if (focusedField === fieldId) {
                        setFocusedField(null);
                      }
                    }, 200);
                  }}
                  placeholder={(fieldConfig as any).placeholder}
                  maxLength={(fieldConfig as any).maxLength}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {(fieldConfig as any).maxLength && (
                  <div className="text-xs text-gray-500 mt-1">
                    {(postData[field] || "").length}/
                    {(fieldConfig as any).maxLength}
                  </div>
                )}
              </div>
            );
          }

          if ((fieldConfig as any).options) {
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {fieldConfig.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  value={postData[field] || (fieldConfig as any).default || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select {field}</option>
                  {(fieldConfig as any).options.map((option: string) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // Check if this field should show AI score (title, description, caption, content)
          const shouldShowAIScore = ['title', 'description', 'caption', 'content'].includes(field);
          const fieldId = `${selectedPlatform}-${field}`;
          const isFieldFocused = focusedField === fieldId;
          
          return (
            <div key={field}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {fieldConfig.required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {shouldShowAIScore && selectedPlatform && (
                  <AIScoreIndicator
                    content={postData[field] || ""}
                    field={field}
                    platform={selectedPlatform}
                    contentType={selectedPostType || "post"}
                    enabled={true}
                    showDetails={true}
                    isFieldFocused={isFieldFocused}
                    onFocusChange={(focused) => {
                      if (focused) {
                        setFocusedField(fieldId);
                      } else if (focusedField === fieldId) {
                        setFocusedField(null);
                      }
                    }}
                  />
                )}
              </div>
              <div className="relative">
                <input
                  type={(fieldConfig as any).type === "url" ? "url" : "text"}
                  value={postData[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onFocus={() => setFocusedField(fieldId)}
                  onBlur={() => {
                    // Delay blur to allow clicking on the popup
                    setTimeout(() => {
                      if (focusedField === fieldId) {
                        setFocusedField(null);
                      }
                    }, 200);
                  }}
                  placeholder={(fieldConfig as any).placeholder}
                  maxLength={(fieldConfig as any).maxLength}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {(fieldConfig as any).maxLength && (
                <div className="text-xs text-gray-500 mt-1">
                  {(postData[field] || "").length}/
                  {(fieldConfig as any).maxLength}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getPlatformIcon = (platform: string) => {
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
    if (!config) return null;
    const IconComponent = config.icon;
    return <IconComponent size={16} className={`text-${config.color}-600`} />;
  };

  
  const headerActions = (
    <>
      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm  text-white px-4 py-2.5 rounded-sm flex items-center space-x-1 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
        <Plus className="w-4 h-4" />
        <span>Create New Post</span>
      </button>
    </>
  );

  return (
    <CreatorLayout
      title="Posts Management"
      subtitle="Create, schedule, and manage your social media posts"
     
    >
      {showShortsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShortsDialog(false)} />
          <div className="relative bg-white rounded-sm border border-gray-200/04 w-full max-w-md p-6 mx-4">
            <div className="mb-4">
              <p className="text-sm text-gray-900">{shortsDialogText}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowShortsDialog(false)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Keep as Video
              </button>
              <button
                type="button"
                onClick={() => { setSelectedPostType('short'); setShowShortsDialog(false); }}
                className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Switch to Short
              </button>
            </div>
          </div>
        </div>
      )}
      {showPublishingDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-sm hover:shadow-sm w-full max-w-sm p-6 mx-4">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPublishingDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Publishing...</p>
                <p className="text-xs text-gray-600">
                  {selectedPlatform === 'youtube'
                    ? 'Uploading to YouTube. This can take a few minutes for videos.'
                    : 'Your post is being published. Please wait...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPublishResultDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPublishResultDialog(false)} />
          <div className="relative bg-white rounded-sm hover:shadow-sm w-full max-w-sm p-6 mx-4">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowPublishResultDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-900">Published</p>
                <p className="text-xs text-gray-600">{publishResultText || 'Your post has been published successfully.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      {/* <div className="mb-4 md:mb-6">
        <h1 className="hidden md:block text-2xl md:text-3xl font-bold text-gray-300">
          Posts
        </h1>
        <p className="hidden md:block mt-1 md:mt-2 text-gray-200">
          Create, schedule, and manage your social media content
        </p>
      </div> */}

      <div className="flex flex-col lg:flex-row justify-between">
         {/* Tabs */}
      <div className="mb-5  flex flex-wrap gap-2 mt-5">
       
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-1 text-xs rounded-xl border transition-all ${
              activeTab === "create"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : " hover:bg-white-300 border border-blue-600 bg-blue-50 text-blue-600 hover:shadow-sm transition-all duration-150"
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
             className={`px-4 py-1 text-xs rounded-xl border transition-all ${
              activeTab === "drafts"
                ? "bg-blue-50 text-blue-700 border-blue-700 shadow-sm"
                : " hover:bg-white-300 border border-blue-600 bg-blue-50 text-blue-600 hover:shadow-sm transition-all duration-150"
            }`}
          >
            Drafts {drafts.length > 0 ? `(${drafts.length})` : ""}
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
             className={`px-4 py-1 text-xs rounded-xl border transition-all ${
              activeTab === "create"
                ? "bg-blue-50 text-blue-700 border-blue-700 shadow-sm"
                : " hover:bg-white-300 border border-blue-600 bg-blue-50 text-blue-600 hover:shadow-md transition-all duration-150"
            }`}
          >
            Scheduled {scheduledPosts.length > 0 ? `(${scheduledPosts.length})` : ""}
          </button>
          <button
            onClick={() => setActiveTab("published")}
             className={`px-4 py-1 text-xs rounded-xl border transition-all ${
              activeTab === "create"
                ? "bg-blue-50 text-blue-700 border-blue-700 shadow-sm"
                : " hover:bg-white-300 border border-blue-600 bg-blue-50 text-blue-600 hover:shadow-sm transition-all duration-150"
            }`}
          >
            Published {posts.length > 0 ? `(${posts.length})` : ""}
          </button>
      </div>
      
     {headerActions && (
     <div className="flex items-center space-x-2">
     {headerActions}
      </div>
     )}
     
      </div>
    

      {/* Create Post Tab */}
      {activeTab === "create" && (
        <div className="rounded-sm p-3 md:p-6 hover:shadow-sm border border-gray-200/04  mt-11">
          <div className="p-2 md:p-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Post
            </h2>
            <p className="text-sm text-gray-600">
              Choose your platform and customize your content
            </p>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Clear Form Button */}


            {/* Debug Info */}

            {/* Platform Status */}
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Platform Status
                </h3>
                <button
                  onClick={() => checkPlatformConnections(true)}
                  disabled={checkingConnections}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 w-full sm:w-auto justify-center"
                >
                  {checkingConnections ? (
                    <>
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Refresh</span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
                  const IconComponent = config.icon;
                  const isConnected = connectedPlatforms.includes(platform);
                  const isSelected = selectedPlatform === platform;

                  return (
                    <div
                      key={platform}
                     
                      className={`p-4 rounded-sm border transition-all duration-200 ${isSelected
                          ? `border-${config.color}-500 bg-${config.color}-50  hover:shadow:sm`
                          : "border-gray-200/80 bg-white"
                        }`}
                    >
                      <div className="flex flex-col  space-x-3">
                        <div className="relative flex gap-3 item-center  ">
                          <IconComponent
                            size={24}
                            className={`text-${config.color}-600`}
                          />
                          {checkingConnections ? (
                            <div className="absolute -top-1 -right-1 w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : isConnected ? (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          ) : null}
                          <h4 className="text-sm font-sm text-gray-900">
                            {config.name}
                          </h4>
                        </div>
                        <div className="flex-1">
                          
                          <div className="mt-3">
                            {checkingConnections ? (
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                <span className="w-3 h-3 mr-2 border border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                                Checking...
                              </div>
                            ) : isConnected ? (
                              <div className="flex flex-col  justify-start">
                                <span className=" inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 border border-green-600 text-green-800 w-fit">
                                ✓ Connected
                                </span>

                                <button
                            onClick={() => handlePlatformSelect(platform)}
                                className=" cursor-pointer px-2 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm text-gray-700 shadow-sm   border border-gray-200/100 rounded hover:shadow:md transition-all duration-150 mt-3"
                                >
                                  Select
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col  space-x-2">
                                <span className="text-xs text-red-600 font-sm">
                                  No account connected
                                </span>
                                <button
                                  onClick={() => {
    try {
      sessionStorage.setItem('invalidate_connections_cache', '1');
    } catch {}
    router.push("/creator/settings#linked_account");
  }}
                                  className="px-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm text-gray-700 shadow-sm   border border-gray-200/100 rounded hover:shadow:md transition-all duration-150 mt-3"
                                >
                                  Connect
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          {showModal && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) setShowModal(false); // click outside to close
    }}
  >
    <div
  className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl p-6 relative animate-fadeIn flex flex-col"
>
  <div className="overflow-y-auto pr-2">
      
      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      {/* 🧩 Your Original Code (No Logic Changed) */}
      {/* Post Type Selection (hidden when only one type) */}
      {selectedPlatform &&
        PLATFORM_CONFIGS[
          selectedPlatform as keyof typeof PLATFORM_CONFIGS
        ].postTypes.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Post Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_CONFIGS[
                selectedPlatform as keyof typeof PLATFORM_CONFIGS
              ].postTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handlePostTypeSelect(type)}
                  className={`px-3 md:px-4 py-2 rounded-lg border transition-colors ${
                    selectedPostType === type
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Media Upload */}
      {selectedPlatform && selectedPostType && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Media Upload
          </h3>
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">
              Upload{" "}
              {PLATFORM_CONFIGS[
                selectedPlatform as keyof typeof PLATFORM_CONFIGS
              ].supportedMedia.join(" or ")}
            </p>
            <p className="text-xs text-gray-500">
              {selectedPlatform === "youtube" &&
                "Video required for YouTube posts"}
            </p>
            <input
              type="file"
              multiple={selectedPlatform !== "youtube"}
              accept={
                PLATFORM_CONFIGS[
                  selectedPlatform as keyof typeof PLATFORM_CONFIGS
                ].supportedMedia.includes("image")
                  ? "image/*,video/*"
                  : "video/*"
              }
              className="hidden"
              onChange={(e) => handleMediaUpload(e.target.files)}
            />
          </label>

          {mediaFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {mediaFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() =>
                      setMediaFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Platform-Specific Fields */}
      <div className="mt-6">{renderPlatformFields()}</div>

      {/* Scheduling */}
      {selectedPlatform && selectedPostType && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Schedule (Optional)
          </h3>
          <input
            type="datetime-local"
            value={postData.scheduledFor || ""}
            onChange={(e) =>
              handleFieldChange("scheduledFor", e.target.value)
            }
            min={new Date().toISOString().slice(0, 16)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Error/Success Messages */}
      {(error || success) && (
        <div className="space-y-2 mt-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 border border-green-200 rounded-md px-4 py-3 text-sm">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {selectedPlatform && selectedPostType && (
        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={() => createPost("draft")}
            disabled={
              loading ||
              (selectedPlatform === "youtube" && !youtubeConnected)
            }
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          {postData.scheduledFor ? (
            <button
              onClick={() => createPost("schedule")}
              disabled={
                loading ||
                (selectedPlatform === "youtube" && !youtubeConnected)
              }
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <Clock size={16} />
              <span>{loading ? "Scheduling..." : "Schedule Post"}</span>
            </button>
          ) : (
            <button
              onClick={() => createPost("publish")}
              disabled={
                loading ||
                (selectedPlatform === "youtube" && !youtubeConnected)
              }
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              <Send size={16} />
              <span>{loading ? "Publishing..." : "Publish Now"}</span>
            </button>
          )}

          {selectedPlatform === "youtube" && !youtubeConnected && (
            <p className="text-sm text-gray-500 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Connect YouTube to enable posting
            </p>
          )}
        </div>
      )}
    </div>
                </div>
                </div>
)}
   
           
          </div>
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === "drafts" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Drafts</h2>
            <p className="text-sm text-gray-600">
              Unpublished and failed posts
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                {drafts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          {post.media?.length > 0 ? (
                            <ImageIcon size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {post.content?.caption || "No caption"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm text-gray-900 capitalize">
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.updatedAt
                        ? new Date(post.updatedAt as any).toLocaleString()
                        : (post as any).createdAt
                          ? new Date((post as any).createdAt).toLocaleString()
                          : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${post.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadDraftIntoForm(post)}
                          className="px-3 py-1.5 text-xs rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDraft(post._id)}
                          className="px-3 py-1.5 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {drafts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No drafts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheduled Posts Tab */}
      {activeTab === "scheduled" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Scheduled Posts
            </h2>
            <p className="text-sm text-gray-600">Manage your upcoming posts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Scheduled For
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200">
                {scheduledPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          {post.media?.length > 0 ? (
                            <ImageIcon size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </div>
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {post.content?.caption || "No caption"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm text-gray-900 capitalize">
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.scheduling?.scheduled_at
                        ? new Date(
                          post.scheduling.scheduled_at
                        ).toLocaleString()
                        : post.scheduling?.scheduled_for
                          ? new Date(
                            post.scheduling.scheduled_for
                          ).toLocaleString()
                          : (post as any).scheduledAt
                            ? new Date((post as any).scheduledAt).toLocaleString()
                            : "Not scheduled"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setOpenMenuScheduledId(
                            openMenuScheduledId === post._id
                              ? null
                              : (post._id as string)
                          )
                        }
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuScheduledId === post._id && (
                        <div className="absolute right-6 mt-2 w-40 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md shadow-lg z-10">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                              setOpenMenuScheduledId(
                                null
                              ); /* TODO: implement view */
                            }}
                          >
                            View
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => {
                              setOpenMenuScheduledId(
                                null
                              ); /* TODO: implement edit */
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setOpenMenuScheduledId(
                                null
                              ); /* TODO: implement cancel schedule */
                            }}
                          >
                            Cancel Schedule
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {scheduledPosts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No scheduled posts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Published Posts Tab */}
      {activeTab === "published" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Published Posts
              </h2>
              <p className="text-sm text-gray-600">
                View your post history and performance
              </p>
            </div>
            <button
              onClick={handleRefreshAnalytics}
              disabled={refreshingAnalytics}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Refresh engagement metrics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingAnalytics ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="overflow-x-auto relative  overflow-visible">
            <table className="w-full relative overflow-visible">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-gray-200 relative">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                          {post.media?.length > 0 ? (
                            <ImageIcon size={14} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </div>
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {post.content?.caption || "No caption"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="text-sm text-gray-900 capitalize">
                          {post.platform}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.publishing?.published_at
                        ? new Date(
                          post.publishing.published_at
                        ).toLocaleString()
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(() => {
                        const metrics = getPostAnalytics(post);
                        return (
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center" title="Likes">
                              <Heart size={12} className={`mr-1 ${metrics.likes > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                              <span className={metrics.likes > 0 ? 'text-gray-700' : 'text-gray-400'}>
                                {metrics.likes.toLocaleString()}
                              </span>
                            </span>
                            <span className="flex items-center" title="Comments">
                              <MessageCircle size={12} className={`mr-1 ${metrics.comments > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className={metrics.comments > 0 ? 'text-gray-700' : 'text-gray-400'}>
                                {metrics.comments.toLocaleString()}
                              </span>
                            </span>
                            <span className="flex items-center" title="Shares">
                              <Share size={12} className={`mr-1 ${metrics.shares > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className={metrics.shares > 0 ? 'text-gray-700' : 'text-gray-400'}>
                                {metrics.shares.toLocaleString()}
                              </span>
                            </span>
                            {metrics.views > 0 && (
                              <span className="flex items-center" title="Views">
                                <Eye size={12} className="mr-1 text-purple-500" />
                                <span className="text-gray-700">
                                  {metrics.views.toLocaleString()}
                                </span>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 relative overflow-visible">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setOpenMenuPublishedId(
                            openMenuPublishedId === post._id
                              ? null
                              : (post._id as string)
                          )
                        }
                      >
                        <MoreHorizontal size={16} />
                      </button>
                     {openMenuPublishedId === post._id && (
               <div  ref={menuRef}
                className="absolute right-0 w-48 bg-white/80 backdrop-blur-sm 
                           border border-gray-200 rounded-md shadow-lg z-[9999] overflow-visible"
              
                style={{
                  transform: "translateY(0)",
                  position: "fixed", // 👈 main fix
                  // adjust depending on scroll
                  right: "2rem",
                }}
              >
      {post.publishing?.platform_url ? (
        <button
          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => handleViewPost(post)}
        >
          <ExternalLink size={14} />
          View on Platform
        </button>
      ) : (
        <button
          className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
          disabled
          title="No platform URL available"
        >
          View on Platform
        </button>
      )}

      {post.publishing?.platform_url ? (
        <button
          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => handleCopyLink(post)}
        >
          <Copy size={14} />
          Copy Link
        </button>
      ) : (
        <button
          className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
          disabled
          title="No link available"
        >
          Copy Link
        </button>
      )}

      <div className="border-t border-gray-200 my-1"></div>

      <button
        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        onClick={() => handleDeletePost(post)}
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  )}
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No published posts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}
